import { Directory, DirectoryHeader, DirectoryId, OrganizationId, TrzModule, TrzModuleType } from '@mosaiq/terrazzo-common/types';
import { createDirectoryDb, DirectoryModelType, getDirectoryByIdDb, updateDirectoryDb } from '@trz-api/persistence/directoryPersistence';
import { getModuleByIdDb, updateModuleDb } from '@trz-api/persistence/modulePersistence';
import { createNewModule } from './moduleController';

export const getDirectory = async (id: DirectoryId): Promise<Directory | undefined> => {
    const model = await getDirectoryByIdDb(id);
    if (!model) {
        return undefined;
    }
    const dirModule = await getModuleByIdDb(id);
    if (!dirModule) {
        throw new Error('Directory module not found');
    }
    const modules = await getModulesInDirectory(id);
    const directory: Directory = {
        ...model,
        ...dirModule,
        type: TrzModuleType.Directory,
        modules,
    };
    return directory;
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
    await updateModuleDb(id, header);
};

/**
 *  Get all modules directly within a directory (no recursion)
 */
export const getModulesInDirectory = async (parentId: DirectoryId | OrganizationId): Promise<TrzModule[]> => {};
