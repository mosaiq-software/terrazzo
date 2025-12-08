import { DirectoryHeader, DirectoryId, MinimalModuleHeader, TrzModuleType, UID, UserId } from '@mosaiq/terrazzo-common';
import { createDirectoryDb, DirectoryModelType, getDirectoryByIdDb, updateDirectoryDb } from '@trz-api/persistence/directoryPersistence';
import { getModulesByParentIdDb } from '@trz-api/persistence/modulePersistence';
import { userCanViewBoard, userCanViewDirectory, userCanViewDocument } from '@trz-api/utils/permissions';
import { createNewModule, getModuleById, updateModule } from './moduleController';

export const getDirectory = async (id: DirectoryId): Promise<DirectoryHeader | undefined> => {
    const dirModule = await getModuleById(id);
    const dirModel = await getDirectoryByIdDb(id);
    if (!dirModule || !dirModel) {
        return undefined;
    }
    const dirHeader: DirectoryHeader = {
        ...dirModel,
        ...dirModule,
        type: TrzModuleType.Directory,
    };
    return dirHeader;
};
export const createDirectory = async (name: string, parentId: DirectoryId): Promise<DirectoryHeader> => {
    const dirModule = await createNewModule(name, parentId, TrzModuleType.Directory);
    const dirModel: DirectoryModelType = {
        id: dirModule.id,
    };
    await createDirectoryDb(dirModel);
    const dirHeader: DirectoryHeader = {
        ...dirModel,
        ...dirModule,
        type: TrzModuleType.Directory,
    };
    return dirHeader;
};

export const updateDirectory = async (id: DirectoryId, header: Partial<DirectoryHeader>) => {
    await updateDirectoryDb(id, header);
    await updateModule(id, header);
};

export const getDirectoryContentsForUser = async (dirId: DirectoryId, userId: UserId): Promise<(MinimalModuleHeader & { canAccess: boolean })[]> => {
    const modules = await getModulesByParentIdDb(dirId);
    const minimalModules: (MinimalModuleHeader & { canAccess: boolean })[] = await Promise.all(
        modules.map(async (mod) => {
            let userCanAccessModule = false;
            switch (mod.type) {
                case TrzModuleType.Board:
                    userCanAccessModule = await userCanViewBoard(userId, mod.id);
                    break;
                case TrzModuleType.Document:
                    userCanAccessModule = await userCanViewDocument(userId, mod.id);
                    break;
                case TrzModuleType.Directory:
                    userCanAccessModule = await userCanViewDirectory(userId, mod.id);
                    break;
            }
            return {
                id: mod.id,
                parentId: mod.parentId,
                name: mod.name,
                type: mod.type,
                order: mod.order,
                canAccess: userCanAccessModule,
            };
        })
    );
    return minimalModules;
};

export const updateDirectoryContents = async (dirId: DirectoryId, moduleIds: UID[]) => {
    throw new Error('updateDirectoryContents not implemented');
};
