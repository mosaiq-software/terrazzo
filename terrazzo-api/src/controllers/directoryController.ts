import { Directory, DirectoryHeader, DirectoryId } from '@mosaiq/terrazzo-common/types';
import { getBoardsByParentId } from '@trz-api/persistence/boardPersistence';
import { createDirectoryDb, getDirectoriesByParentIdDb, getDirectoryByIdDb, updateDirectoryDb } from '@trz-api/persistence/directoryPersistence';
import { getAllDocumentsForParent } from './documentController';

export const getDirectory = async (id: DirectoryId): Promise<Directory | undefined> => {
    const header = await getDirectoryByIdDb(id);
    if (!header) {
        return undefined;
    }
    const subdirectories = await getDirectoriesByParentIdDb(id);
    const documents = await getAllDocumentsForParent(id);
    const boards = await getBoardsByParentId(id);
    const directory: Directory = {
        ...header,
        subdirectories,
        documents,
        boards,
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
