import { DirectoryHeader, DirectoryId, ModuleHeader, TrzModuleType, UID, UserId } from '@mosaiq/terrazzo-common';
import { syncDirectoryContents, syncDirectoryField } from '@trz-api/broadcasters';
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

    // Update parent's directory contents
    await syncDirectoryContents(dirHeader.parentId);

    return dirHeader;
};

export const updateDirectory = async (id: DirectoryId, header: Partial<DirectoryHeader>) => {
    await updateDirectoryDb(id, header);
    await updateModule(id, header);
    const updatedDir = await getDirectory(id);
    if (!updatedDir) {
        throw new Error('No directory found after update');
    }
    await syncDirectoryField(updatedDir);
    await syncDirectoryContents(updatedDir.parentId);
};

export const getDirectoryContentsForUser = async (dirId: DirectoryId, userId: UserId): Promise<(ModuleHeader & { canAccess: boolean })[]> => {
    const modules = await getModulesByParentIdDb(dirId);
    const canAccessModules: (ModuleHeader & { canAccess: boolean })[] = await Promise.all(
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
                ...mod,
                canAccess: userCanAccessModule,
            };
        })
    );
    return canAccessModules;
};

export const updateDirectoryContents = async (dirId: DirectoryId, moduleIds: UID[]) => {
    await syncDirectoryContents(dirId);

    throw new Error('updateDirectoryContents not implemented');
};
