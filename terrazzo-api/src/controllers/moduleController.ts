import {
    CreateModuleData,
    CreateModuleDataArgs,
    exhaustiveCheck,
    ModuleData,
    ModuleHeader,
    ModuleId,
    ModuleType,
    TextBlockType,
    TrzModule,
    UserId,
} from '@mosaiq/terrazzo-common';
import { syncModuleChildren } from '@trz-api/broadcasters';
import { getModulesByParentIdDb, getNextModuleOrderInParentDb } from '@trz-api/persistence/modulePersistence';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { moduleHandler } from './dataSources/objectHandlers/module';
import { textBlockHandler } from './dataSources/objectHandlers/textBlock';

async function buildModuleData<T extends ModuleType>(args: {
    type: T;
    initialData: CreateModuleData<T>;
}): Promise<ModuleData<T>>;
async function buildModuleData(args: CreateModuleDataArgs): Promise<ModuleData<ModuleType>> {
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

export const createNewModule = async <T extends ModuleType>(
    name: string,
    parentId: ModuleId,
    type: T,
    initialData: CreateModuleData<T>
): Promise<ModuleHeader<T>> => {
    const nextOrder = await getNextModuleOrderInParentDb(parentId);
    const moduleData = await buildModuleData({ type, initialData });
    const moduleId = await moduleHandler.create({
        parentId,
        name,
        type,
        order: nextOrder,
        data: moduleData,
    });

    const newModule = await moduleHandler.read(moduleId);
    if (!newModule) {
        throw new Error('Failed to read created module');
    }

    await syncModuleChildren(parentId);
    return newModule as ModuleHeader<T>;
};

export const updateModule = async <T extends TrzModule>(
    id: ModuleId,
    _type: T,
    partial: Partial<ModuleHeader<T>>
): Promise<void> => {
    await moduleHandler.update(id, partial, { preventSync: true });
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
