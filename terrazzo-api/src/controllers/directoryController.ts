import { DirectoryHeader, DirectoryId, ModuleHeader, TrzModuleType, UserId } from '@mosaiq/terrazzo-common';
import { syncDirectoryContents, syncDirectoryField } from '@trz-api/broadcasters';
import { updateDirectoryDb } from '@trz-api/persistence/directoryPersistence';
import { getModulesByParentIdDb } from '@trz-api/persistence/modulePersistence';
import { userCanViewBoard, userCanViewDirectory, userCanViewDocument } from '@trz-api/utils/permissions';
import { updateModule } from './moduleController';

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

export const getDirectoryContentsForUser = async (
    dirId: DirectoryId,
    userId: UserId
): Promise<(ModuleHeader & { canAccess: boolean })[]> => {
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
