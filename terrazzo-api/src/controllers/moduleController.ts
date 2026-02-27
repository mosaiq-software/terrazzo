import {
    calculateModuleEffectivePermissions,
    CreateModuleData,
    CreateModuleDataArgs,
    exhaustiveCheck,
    ModuleData,
    ModuleHeader,
    ModuleId,
    ModulePermissions,
    ModuleType,
    TextBlockType,
    TrzModule,
    UID,
    UserId,
} from '@mosaiq/terrazzo-common';
import { getModulesByParentIdDb, updateModuleDb } from '@trz-api/persistence/modulePersistence';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { textBlockHandler } from './dataSources/objectHandlers/textBlock';

export async function buildModuleData<T extends ModuleType>(args: {
    type: T;
    initialData: CreateModuleData<T>;
}): Promise<ModuleData<T>>;
export async function buildModuleData(args: CreateModuleDataArgs): Promise<ModuleData<ModuleType>> {
    switch (args.type) {
        case TrzModule.Directory: {
            const data: ModuleData<TrzModule.Directory> = {};
            return data;
        }
        case TrzModule.Document: {
            const textBlockId = await textBlockHandler.create({
                text: JSON.stringify([]),
                type: TextBlockType.BlockNote,
                trackHistory: true,
            });
            if (!textBlockId) {
                throw new Error('Failed to create main text block for document');
            }
            const data: ModuleData<TrzModule.Document> = {
                textBlockId: textBlockId,
                lastModifiedAt: Date.now(),
                lastModifiedByUserId: args.initialData.createdByUserId,
            };
            return data;
        }
        case TrzModule.Board: {
            const data: ModuleData<TrzModule.Board> = {
                boardCode: args.initialData.boardCode,
            };
            return data;
        }
        default:
            return exhaustiveCheck(args);
    }
}

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

export const recursivelyUpdateModuleEffectivePermissions = async (
    id: UID,
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
