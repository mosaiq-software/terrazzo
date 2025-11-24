import { DirectoryHeader, DirectoryId, TrzModuleType } from '@mosaiq/terrazzo-common/types';
import { createDirectoryDb, DirectoryModelType, updateDirectoryDb } from '@trz-api/persistence/directoryPersistence';
import { updateModuleDb } from '@trz-api/persistence/modulePersistence';
import { createNewModule } from './moduleController';

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
