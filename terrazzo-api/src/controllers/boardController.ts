import { BoardHeader, BoardId, BoardRes, DirectoryId, Label, LabelId, ListId, TrelloExportType, TrelloLabelColorsMap, TrzModuleType } from '@mosaiq/terrazzo-common';
import { syncBoardFields, syncDirectoryContents, syncParentsDirectoryContents } from '@trz-api/broadcasters';
import { addList, getListAndCardIdsOnBoard, moveList, updateListFromPartial } from '@trz-api/controllers/listController';
import { BoardModelType, createBoardDb, getBoardByIdDb, updateBoardDb } from '@trz-api/persistence/boardPersistence';
import { createLabelOnBoardDb, deleteLabelDb, deleteLabelingOnCardsByLabelIdDb, getLabelByIdDb, getLabelsByBoardIdDb, updateLabelDb } from '@trz-api/persistence/labelPersistence';
import { addCard, moveCardToList, setCardsLabels, updateCardFromPartial } from './cardController';
import { createNewModule, getModuleById, updateModule } from './moduleController';

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

export async function createBoardLabel(boardId: BoardId, name: string, color: string): Promise<Label[]> {
    const label: Label = {
        name,
        color,
        boardId,
        id: crypto.randomUUID(),
    };
    await createLabelOnBoardDb(label, boardId);
    return await getLabelsByBoardIdDb(boardId);
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

export async function removeBoardLabel(boardId: BoardId, labelId: LabelId): Promise<Label[]> {
    await deleteLabelDb(labelId);
    await deleteLabelingOnCardsByLabelIdDb(labelId);
    return await getLabelsByBoardIdDb(boardId);
}

export async function updateBoardLabels(boardId: BoardId, updatedLabel: Label): Promise<Label[]> {
    const label = await getLabelByIdDb(updatedLabel.id);
    if (!label) {
        throw new Error('Label does not exist');
    }

    await updateLabelDb(updatedLabel);
    return await getLabelsByBoardIdDb(boardId);
}

export const createTerrazzoBoardFromTrelloBoard = async (onParentId: DirectoryId, trelloBoard: TrelloExportType) => {
    const boardName = trelloBoard.name;
    const trelloLists = trelloBoard.lists;
    const trelloCards = trelloBoard.cards;

    // Trello id --> trz id
    const listMap: { [trl: string]: ListId } = {};
    const labelMap: { [trl: string]: LabelId } = {};

    try {
        const trzBoardId = await addBoard(boardName, '', onParentId);
        for (const trelloList of trelloLists) {
            const trelloListName = trelloList.name;
            const trelloListOrder = trelloList.pos;

            const trzList = await addList(trzBoardId, trelloListName);
            await moveList(trzList.id, trelloListOrder);
            await updateListFromPartial(trzList.id, { archived: trelloList.closed });
            listMap[trelloList.id] = trzList.id;
        }

        for (const trlLabel of trelloBoard.labels) {
            const labelId = await createBoardLabelSingle(trzBoardId, trlLabel.name, TrelloLabelColorsMap[trlLabel.color]);
            labelMap[trlLabel.id] = labelId;
        }

        for (const trlCard of trelloCards) {
            const trlCardName = trlCard.name;
            const trlCardDesc = trlCard.desc;
            const trlCardLabelIds = trlCard.idLabels;
            const trlCardListId = trlCard.idList;
            const trlCardOrder = trlCard.pos;
            const trlCardNumber = trlCard.idShort;

            const trzListId = listMap[trlCardListId];
            const trzCard = await addCard(trzListId, trlCardName, trlCardDesc, trlCardNumber, undefined);
            await moveCardToList(trzCard.id, trzListId, trlCardOrder);
            const trzLabelIds = trlCardLabelIds.map((trlLabelId) => labelMap[trlLabelId]);
            await setCardsLabels(trzCard.id, trzLabelIds);

            const trelloCardPlugins = trlCard.pluginData;
            const storyPointPluginId = '638372c5e00ec1016bb45460';
            let sp: number | undefined = undefined;
            trelloCardPlugins.forEach((plugin) => {
                if (plugin.idPlugin === storyPointPluginId) {
                    const val = plugin.value; //{\"storyPoints\":2}
                    sp = parseInt(val.replace(/\D/g, ''));
                }
            });
            await updateCardFromPartial(trzCard.id, { archived: trlCard.closed, storyPoints: sp });
        }

        return trzBoardId;
    } catch (error: any) {
        console.error('Error importing from trello', error);
        return undefined;
    }
};
