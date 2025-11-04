import { createBoard, getBoardById, updateBoard } from '@trz-api/persistence/boardPersistence';
import { createLabelOnBoard, deleteLabel, deleteLabelingOnCardsByLabelId, deleteLabelsByBoardId, getLabelById, getLabelsByBoardId, updateLabel } from '@trz-api/persistence/labelPersistence';
import { addList, getAllListsOfBoard, getListAndCardIdsOnBoard, moveList, updateListFromPartial } from '@trz-api/controllers/listController';
import { Board, BoardHeader, BoardId, BoardRes, Label, LabelId, ListId, ProjectId } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { TrelloExportType, TrelloLabelColorsMap } from '@mosaiq/terrazzo-common/trelloTypes';
import { addCard, moveCardToList, setCardsLabels, updateCardFromPartial } from './cardController';
import { getMembersInProjectWithOrgDeduped } from './membershipController';

//Gets

/**
 * Gets a board by its ID
 * Returns a promise of the type Board with all its lists, members, and labels
 * @param boardID
 */
export async function getWholeBoard(boardID: BoardId) {
    //pull board from db with ID
    const boardHeader = await getBoardById(boardID);

    if (boardHeader == null) {
        throw new Error('Board not found');
    }

    const projectMembers = await getMembersInProjectWithOrgDeduped(boardHeader.projectId);

    try {
        const board: Board = {
            ...boardHeader,
            lists: await getAllListsOfBoard(boardID, false), //we dont want archived lists when getting whole board
            labels: await getLabelsByBoardId(boardID),
            members: projectMembers,
        };
        return board;
    } catch (e) {
        throw new Error('Failed to retrieve board' + e);
    }
}

export async function getBoardRes(boardID: BoardId): Promise<BoardRes | undefined> {
    const boardHeader = await getBoardById(boardID);
    if (boardHeader == null) {
        throw new Error('Board not found');
    }

    const projectMembers = await getMembersInProjectWithOrgDeduped(boardHeader.projectId);

    try {
        const board: BoardRes = {
            ...boardHeader,
            lists: await getListAndCardIdsOnBoard(boardID, false),
            labels: await getLabelsByBoardId(boardID),
            members: projectMembers,
        };
        return board;
    } catch (e) {
        throw new Error('Failed to retrieve board' + e);
    }
}

//Creates

/**
 * Adds a new board to the database
 * You must pass in the board name and code
 * Returns the ID of the new board
 * @param name
 * @param boardCode
 */
export async function addBoard(name: string, boardCode: string, projectId: ProjectId) {
    if (name.length > 50) {
        throw new Error('Title must be 50 characters or less');
    }
    const projectMembers = await getMembersInProjectWithOrgDeduped(projectId);

    const newBoard: Board = {
        id: crypto.randomUUID(),
        projectId,
        boardCode,
        name,
        lists: [],
        labels: [],
        members: projectMembers,
        archived: false,
        createdAt: Date.now(),
        totalCards: 0,
    };

    try {
        await createBoard(newBoard);
        return newBoard.id;
    } catch (e) {
        throw new Error('Failed to save board' + e);
    }
}

export async function updateBoardFromPartial(boardId: BoardId, partial: Partial<BoardHeader>) {
    const updatingBoard = await getBoardById(boardId);
    if (updatingBoard == null) {
        throw new Error('Board not found');
    }

    const updated = updateBaseFromPartial<BoardHeader>(updatingBoard, partial);
    try {
        await updateBoard(updated);
    } catch (e: any) {
        throw new Error('Failed to update board ' + e);
    }
}

export async function createBoardLabel(boardId: BoardId, name: string, color: string): Promise<Label[]> {
    const label: Label = {
        name,
        color,
        id: crypto.randomUUID(),
    };
    await createLabelOnBoard(label, boardId);
    return await getLabelsByBoardId(boardId);
}

export async function createBoardLabelSingle(boardId: BoardId, name: string, color: string): Promise<LabelId> {
    const label: Label = {
        name,
        color,
        id: crypto.randomUUID(),
    };
    await createLabelOnBoard(label, boardId);
    return label.id;
}

export async function removeBoardLabel(boardId: BoardId, labelId: LabelId): Promise<Label[]> {
    await deleteLabel(labelId);
    await deleteLabelingOnCardsByLabelId(labelId);
    return await getLabelsByBoardId(boardId);
}

export async function updateBoardLabels(boardId: BoardId, updatedLabel: Label): Promise<Label[]> {
    const label = await getLabelById(updatedLabel.id);
    if (!label) {
        throw new Error('Label does not exist');
    }

    await updateLabel(updatedLabel);
    return await getLabelsByBoardId(boardId);
}

export const createTerrazzoBoardFromTrelloBoard = async (onProjectId: ProjectId, trelloBoard: TrelloExportType) => {
    const boardName = trelloBoard.name;
    const trelloLists = trelloBoard.lists;
    const trelloCards = trelloBoard.cards;

    // Trello id --> trz id
    const listMap: { [trl: string]: ListId } = {};
    const labelMap: { [trl: string]: LabelId } = {};

    try {
        const trzBoardId = await addBoard(boardName, '', onProjectId);
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
