import { BoardHeader, BoardId, BoardRes, DirectoryId, Label, LabelId, TrzModuleType } from '@mosaiq/terrazzo-common';
import { syncBoardFields, syncDirectoryContents, syncParentsDirectoryContents } from '@trz-api/broadcasters';
import { syncBoardLabels } from '@trz-api/broadcasters/labelBroadcaster';
import { getListAndCardIdsOnBoard } from '@trz-api/controllers/listController';
import { BoardModelType, createBoardDb, getBoardByIdDb, updateBoardDb } from '@trz-api/persistence/boardPersistence';
import {
    createLabelOnBoardDb,
    deleteLabelDb,
    deleteLabelingOnCardsByLabelIdDb,
    getLabelByIdDb,
    getLabelsByBoardIdDb,
    updateLabelDb,
} from '@trz-api/persistence/labelPersistence';
import { createNewModule, getModuleById, updateModule } from '../moduleController';

export const getBoardHeader = async (boardID: BoardId): Promise<BoardHeader | undefined> => {
    const boardModel = await getBoardByIdDb(boardID);
    const moduleModel = await getModuleById(boardID);
    if (!boardModel || !moduleModel) {
        return undefined;
    }
    const boardHeader: BoardHeader = {
        ...moduleModel,
        ...boardModel,
        type: TrzModuleType.Board,
    };
    return boardHeader;
};

export async function getBoardRes(boardID: BoardId): Promise<BoardRes | undefined> {
    const boardHeader = await getBoardHeader(boardID);
    if (!boardHeader) {
        return undefined;
    }
    const lists = await getListAndCardIdsOnBoard(boardID, false);
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
    const boardModule = await createNewModule(name, parentId, TrzModuleType.Board);
    const boardModel: BoardModelType = {
        id: boardModule.id,
        boardCode,
        totalCards: 0,
    };
    await createBoardDb(boardModel);
    await syncDirectoryContents(parentId);
    return boardModel.id;
}

export async function updateBoardFromPartial(boardId: BoardId, partial: Partial<BoardHeader>) {
    try {
        await updateBoardDb(boardId, partial);
        await updateModule(boardId, partial);
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
