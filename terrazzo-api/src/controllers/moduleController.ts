import {
    calculateModuleEffectivePermissions,
    ModuleDataMap,
    ModuleHeader,
    ModuleId,
    ModulePermissions,
    TrzModuleType,
} from '@mosaiq/terrazzo-common';
import {
    createModuleDb,
    getModuleByIdDb,
    getModulesByParentIdDb,
    getNextModuleOrderInParentDb,
    updateModuleDataDb,
    updateModuleDb,
} from '@trz-api/persistence/modulePersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';

export const createNewModule = async <T extends TrzModuleType>(
    name: string,
    parentId: ModuleId,
    type: T,
    initialData: ModuleDataMap[T]
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
        data: initialData,
    };
    await createModuleDb(newModule);
    return newModule;
};

/**
 * Type assertion helper to ensure a module is of the expected type. Throws if the type does not match.
 */
export const isModuleType = <T extends TrzModuleType>(module: ModuleHeader, type: T): module is ModuleHeader<T> => {
    return module.type === type;
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

    if (!desiredPermissions) {
        return;
    }
    // handle permissions separately
    await updateModulePermissions(id, desiredPermissions);
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
