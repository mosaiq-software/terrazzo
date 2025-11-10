import { Directory, DirectoryHeader, DirectoryId, OrganizationId, TrzModule, TrzModuleType } from '@mosaiq/terrazzo-common/types';
import { getBoardsByParentId } from '@trz-api/persistence/boardPersistence';
import { createDirectoryDb, getDirectoriesByParentIdDb, getDirectoryByIdDb, updateDirectoryDb } from '@trz-api/persistence/directoryPersistence';
import { getAllDocumentsForParent } from './documentController';

export const getDirectory = async (id: DirectoryId): Promise<Directory | undefined> => {
    const header = await getDirectoryByIdDb(id);
    if (!header) {
        return undefined;
    }
    const modules = await getModulesInDirectory(id);
    const directory: Directory = {
        ...header,
        modules,
    };
    return directory;
};

export const createDirectory = async (name: string, parentId: DirectoryId | null): Promise<DirectoryHeader> => {
    const newDirectory: DirectoryHeader = {
        id: crypto.randomUUID(),
        name,
        parentId,
        archived: false,
        createdAt: Date.now(),
    };
    await createDirectoryDb(newDirectory);
    return newDirectory;
};

export const updateDirectory = async (id: DirectoryId, header: Partial<DirectoryHeader>) => {
    await updateDirectoryDb(id, header);
};

export const getModulesInDirectory = async (parentId: DirectoryId | OrganizationId): Promise<TrzModule[]> => {
    const directories = await getDirectoriesByParentIdDb(parentId);
    const documents = await getAllDocumentsForParent(parentId);
    const boards = await getBoardsByParentId(parentId);

    const modules: TrzModule[] = [];
    for (const dir of directories) {
        modules.push({
            type: TrzModuleType.Directory,
            directory: dir,
        });
    }
    for (const doc of documents) {
        modules.push({
            type: TrzModuleType.Document,
            document: doc,
        });
    }
    for (const board of boards) {
        modules.push({
            type: TrzModuleType.Board,
            board: board,
        });
    }
    return modules;
};
