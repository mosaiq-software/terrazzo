import { DirectoryHeader, DirectoryId, MinimalModuleHeader, TrzModuleType, UID } from '@mosaiq/terrazzo-common/types';
import { createDirectoryDb, DirectoryModelType, getDirectoryByIdDb, updateDirectoryDb } from '@trz-api/persistence/directoryPersistence';
import { getModuleByIdDb, getModulesByParentIdDb, updateModuleDb } from '@trz-api/persistence/modulePersistence';
import { createNewModule } from './moduleController';

export const getDirectory = async (id: DirectoryId): Promise<DirectoryHeader | undefined> => {
    const dirModule = await getModuleByIdDb(id);
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
    await updateModuleDb(id, header);
};

export const getDirectoryContents = async (dirId: DirectoryId): Promise<MinimalModuleHeader[]> => {
    const modules = await getModulesByParentIdDb(dirId);
    // discard unneeded fields for listing to reduce payload size
    const minimalModules: MinimalModuleHeader[] = modules.map((mod) => ({
        id: mod.id,
        parentId: mod.parentId,
        name: mod.name,
        type: mod.type,
        order: mod.order,
    }));
    return minimalModules;
};

export const updateDirectoryContents = async (dirId: DirectoryId, moduleIds: UID[]) => {};
