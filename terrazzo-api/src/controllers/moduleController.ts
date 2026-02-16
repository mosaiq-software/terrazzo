import {
    calculateModuleEffectivePermissions,
    CreatableModuleType,
    CreateModuleData,
    CreateModuleDataArgs,
    exhaustiveCheck,
    isModuleType,
    ModuleData,
    ModuleHeader,
    ModuleId,
    ModulePermissions,
    TrzModuleType,
    UserId,
} from '@mosaiq/terrazzo-common';
import { syncModuleChildren } from '@trz-api/broadcasters';
import {
    createModuleDb,
    getModuleByIdDb,
    getModulesByParentIdDb,
    getNextModuleOrderInParentDb,
    updateModuleDataDb,
    updateModuleDb,
} from '@trz-api/persistence/modulePersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { createBlocknoteTextBlockWithBlocks } from './textBlockController/textBlockController';

async function buildModuleData<T extends CreatableModuleType>(args: {
    type: T;
    initialData: CreateModuleData<T>;
}): Promise<ModuleData<T>>;
async function buildModuleData(args: CreateModuleDataArgs): Promise<ModuleData<CreatableModuleType>> {
    switch (args.type) {
        case TrzModuleType.Directory: {
            const data: ModuleData<TrzModuleType.Directory> = {};
            return data;
        }
        case TrzModuleType.Document: {
            const textBlock = await createBlocknoteTextBlockWithBlocks([]);
            if (!textBlock) {
                throw new Error('Failed to create main text block for document');
            }
            const data: ModuleData<TrzModuleType.Document> = {
                textBlockId: textBlock.id,
                lastModifiedAt: Date.now(),
                lastModifiedByUserId: args.initialData.createdByUserId,
            };
            return data;
        }
        case TrzModuleType.Board: {
            const data: ModuleData<TrzModuleType.Board> = {
                boardCode: args.initialData.boardCode,
            };
            return data;
        }
        default:
            return exhaustiveCheck(args);
    }
}

export const createNewModule = async <T extends CreatableModuleType>(
    name: string,
    parentId: ModuleId,
    type: T,
    initialData: CreateModuleData<T>
): Promise<ModuleHeader<T>> => {
    const parentModule = await getUntypedModuleById(parentId);
    let orgId = parentModule?.orgId;
    if (!orgId) {
        const org = await getOrgByIdDb(parentId);
        if (!org) {
            throw new Error('Parent module or organization not found');
        }
        orgId = org.id;
    }
    const nextOrder = await getNextModuleOrderInParentDb(parentId);
    const moduleData = await buildModuleData({ type, initialData });
    const newModule: ModuleHeader<T> = {
        id: crypto.randomUUID(),
        parentId,
        name,
        type,
        orgId,
        order: nextOrder,
        archived: false,
        createdAt: Date.now(),
        desiredPermissions: {},
        effectivePermissions: {},
        public: false,
        data: moduleData,
    };
    await createModuleDb(newModule);
    await syncModuleChildren(parentId);
    return newModule;
};

/**
 * Retrieves a module by ID and asserts it is of the expected type. Throws if the type does not match.
 * @throws Error if the module is not of the expected type
 */
export async function getModuleById<T extends TrzModuleType>(
    id: ModuleId,
    expectedType: T
): Promise<ModuleHeader<T> | undefined> {
    const module = await getModuleByIdDb(id);
    if (!module) {
        return undefined;
    }
    if (!isModuleType(module, expectedType)) {
        throw new Error(`Module with id ${id} is not of type ${expectedType}`);
    }
    return module;
}

export async function getUntypedModuleById(id: ModuleId): Promise<ModuleHeader | undefined> {
    const module = await getModuleByIdDb(id);
    if (!module) {
        return undefined;
    }
    return module;
}

export const updateModule = async <T extends TrzModuleType>(
    id: ModuleId,
    type: T,
    partial: Partial<ModuleHeader<T>>
): Promise<void> => {
    const desiredPermissions = partial.desiredPermissions;
    const data = partial.data;
    // handle simple fields
    delete partial.desiredPermissions;
    delete partial.effectivePermissions;
    delete partial.data;

    if (partial && Object.keys(partial).length > 0) {
        await updateModuleDb(id, partial);
    }
    if (data && Object.keys(data).length > 0) {
        await updateModuleDataDb(id, type, data);
    }
    if (desiredPermissions) {
        await updateModulePermissions(id, desiredPermissions);
    }
};

const updateModulePermissions = async (id: ModuleId, desiredPermissions: ModulePermissions): Promise<void> => {
    const module = await getModuleByIdDb(id);
    if (!module) {
        throw new Error('Module not found');
    }
    const parentModule = await getModuleByIdDb(module.parentId);
    const parentEffectivePermissions = parentModule?.effectivePermissions;
    const newEffectivePermissions = calculateModuleEffectivePermissions(parentEffectivePermissions, desiredPermissions);
    await updateModuleDb(id, {
        desiredPermissions,
        effectivePermissions: newEffectivePermissions,
    });
    await recursivelyUpdateModuleEffectivePermissions(id, newEffectivePermissions);
};

const recursivelyUpdateModuleEffectivePermissions = async (
    id: ModuleId,
    parentEffectivePermissions: ModulePermissions
): Promise<void> => {
    const childModules = await getModulesByParentIdDb(id);
    for (const childModule of childModules) {
        const newEffectivePermissions = calculateModuleEffectivePermissions(
            parentEffectivePermissions,
            childModule.desiredPermissions
        );
        await updateModuleDb(childModule.id, {
            effectivePermissions: newEffectivePermissions,
        });
        await recursivelyUpdateModuleEffectivePermissions(childModule.id, newEffectivePermissions);
    }
};

export const getModuleChildrenForUser = async (
    moduleId: ModuleId,
    userId: UserId
): Promise<(ModuleHeader & { canAccess: boolean })[]> => {
    const modules = await getModulesByParentIdDb(moduleId);
    const canAccessModules: (ModuleHeader & { canAccess: boolean })[] = await Promise.all(
        modules.map(async (mod) => {
            return {
                ...mod,
                canAccess: await userCanViewModule(userId, mod.id),
            };
        })
    );
    return canAccessModules;
};
