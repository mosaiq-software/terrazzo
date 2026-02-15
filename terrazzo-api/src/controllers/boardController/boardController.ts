import { BoardRes, Label, LabelId, ModuleHeader, TrzModuleType } from '@mosaiq/terrazzo-common';
import { syncBoardFields, syncDirectoryContents, syncParentsDirectoryContents } from '@trz-api/broadcasters';
import { syncBoardLabels } from '@trz-api/broadcasters/labelBroadcaster';
import { getListAndCardIdsOnBoard } from '@trz-api/controllers/listController';
import { deleteLabelingOnCardsByLabelIdDb } from '@trz-api/persistence/labelAssignmentPersistence';
import {
    createLabelOnBoardDb,
    deleteLabelDb,
    getLabelByIdDb,
    getLabelsByBoardIdDb,
    updateLabelDb,
} from '@trz-api/persistence/labelPersistence';
import { createNewModule, getModuleById, updateModule } from '../moduleController';

export async function getBoardRes(boardID: BoardId): Promise<BoardRes | undefined> {
    const boardHeader = await getModuleById(boardID, TrzModuleType.Board);
    if (!boardHeader) {
        return undefined;
    }
    const lists = await getListAndCardIdsOnBoard(boardID);
    const labels = await getLabelsByBoardIdDb(boardID);

    try {
        const boardRes: BoardRes = {
            ...boardHeader,
            lists: lists,
            labels: labels,
        };
        return boardRes;
    } catch (e) {
        throw new Error('Failed to retrieve board' + e);
    }
}

/**
 * Adds a new board to the database
 * You must pass in the board name and code
 * Returns the ID of the new board
 * @param name
 * @param boardCode
 */
export async function addBoard(name: string, boardCode: string, parentId: DirectoryId) {
    const boardModule = await createNewModule(name, parentId, TrzModuleType.Board, {
        boardCode,
    });
    await syncDirectoryContents(parentId);
    return boardModule.id;
}

export async function updateBoardFromPartial(boardId: BoardId, partial: Partial<ModuleHeader<TrzModuleType.Board>>) {
    try {
        await updateModule(boardId, TrzModuleType.Board, partial);
        await syncBoardFields(boardId);
        await syncParentsDirectoryContents(boardId);
    } catch (e: any) {
        throw new Error('Failed to update board ' + e);
    }
}

export async function createBoardLabel(boardId: BoardId, name: string, color: string): Promise<LabelId> {
    const label: Label = {
        name,
        color,
        boardId,
        id: crypto.randomUUID(),
    };
    await createLabelOnBoardDb(label, boardId);

    // Sync updated labels to clients
    const labels = await getLabelsByBoardIdDb(boardId);
    await syncBoardLabels(boardId, labels);

    return label.id;
}

export async function createBoardLabelSingle(boardId: BoardId, name: string, color: string): Promise<LabelId> {
    const label: Label = {
        name,
        color,
        boardId,
        id: crypto.randomUUID(),
    };
    await createLabelOnBoardDb(label, boardId);
    return label.id;
}

export async function removeBoardLabel(boardId: BoardId, labelId: LabelId) {
    await deleteLabelDb(labelId);
    await deleteLabelingOnCardsByLabelIdDb(labelId);

    // Sync updated labels to clients
    const labels = await getLabelsByBoardIdDb(boardId);
    await syncBoardLabels(boardId, labels);
}

export async function updateBoardLabels(boardId: BoardId, updatedLabel: Label) {
    const label = await getLabelByIdDb(updatedLabel.id);
    if (!label) {
        throw new Error('Label does not exist');
    }

    await updateLabelDb(updatedLabel);

    // Sync updated labels to clients
    const labels = await getLabelsByBoardIdDb(boardId);
    await syncBoardLabels(boardId, labels);
}
