import {
    BoardHeader,
    BoardId,
    BoardRes,
    DirectoryId,
    getFileUrl,
    Label,
    LabelId,
    ListId,
    TrelloExportType,
    TrelloLabelColorsMap,
    TrelloUserToTerrazzoUserMap,
    TrzModuleType,
} from '@mosaiq/terrazzo-common';
import { syncBoardFields, syncDirectoryContents, syncParentsDirectoryContents } from '@trz-api/broadcasters';
import { syncBoardLabels } from '@trz-api/broadcasters/labelBroadcaster';
import {
    addList,
    getListAndCardIdsOnBoard,
    moveList,
    updateListFromPartial,
} from '@trz-api/controllers/listController';
import { BoardModelType, createBoardDb, getBoardByIdDb, updateBoardDb } from '@trz-api/persistence/boardPersistence';
import {
    createLabelOnBoardDb,
    deleteLabelDb,
    deleteLabelingOnCardsByLabelIdDb,
    getLabelByIdDb,
    getLabelsByBoardIdDb,
    updateLabelDb,
} from '@trz-api/persistence/labelPersistence';
import { getApiUrl } from '@trz-api/utils/envUtils';
import { addAssigneeToCard } from './cardAssignmentController';
import { addCard, moveCardToList, setCardsLabels, updateCardFromPartial } from './cardController';
import { yoinkFile } from './fileController';
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

export const createTerrazzoBoardFromTrelloBoard = async (
    onParentId: DirectoryId,
    trelloBoard: TrelloExportType,
    userMap: TrelloUserToTerrazzoUserMap
) => {
    const boardName = trelloBoard.name;
    const trelloLists = trelloBoard.lists;
    const trelloCards = trelloBoard.cards;

    // Trello id --> trz id
    const listMap: { [trl: string]: ListId } = {};
    const labelMap: { [trl: string]: LabelId } = {};

    try {
        // Create the Terrazzo board
        const trzBoardId = await addBoard(boardName, '', onParentId);
        for (const trelloList of trelloLists) {
            const trelloListName = trelloList.name;
            const trelloListOrder = trelloList.pos;

            const trzList = await addList(trzBoardId, trelloListName);
            await moveList(trzList.id, trelloListOrder);
            await updateListFromPartial(trzList.id, { archived: trelloList.closed });
            listMap[trelloList.id] = trzList.id;
        }

        // Add labels to the board
        for (const trelloLabel of trelloBoard.labels) {
            const labelId = await createBoardLabelSingle(
                trzBoardId,
                trelloLabel.name,
                TrelloLabelColorsMap[trelloLabel.color]
            );
            labelMap[trelloLabel.id] = labelId;
        }

        // Get the date when each card was created
        const cardCreatedDateMap: Record<string, Date> = {};
        for (const action of trelloBoard?.actions || []) {
            if (action.type === 'createCard') {
                const cardId = action.data.card.id;
                cardCreatedDateMap[cardId] = new Date(action.date);
            }
        }

        // Add cards to the board
        for (const trelloCard of trelloCards) {
            // Copy over each image in the card description to Terrazzo's storage
            let cardDesc = trelloCard.desc;
            const extractedImages = extractMarkdownImagesFromText(cardDesc);
            for (const imageUrl of extractedImages) {
                try {
                    const createdFile = await yoinkFile(imageUrl);
                    const terrazzoFileUrl = getFileUrl(createdFile.id, getApiUrl());
                    const regex = new RegExp(imageUrl, 'g');
                    cardDesc = cardDesc.replace(regex, terrazzoFileUrl);
                } catch (error) {
                    console.error('Error yoinking file from Trello card description:', error);
                }
            }

            // Create the card
            const trlCardName = trelloCard.name;
            const trlCardLabelIds = trelloCard.idLabels;
            const trlCardListId = trelloCard.idList;
            const trlCardOrder = trelloCard.pos;
            const trlCardNumber = trelloCard.idShort;
            const trlCardCreatedDate = cardCreatedDateMap[trelloCard.id] || new Date();
            const trzListId = listMap[trlCardListId];
            const trzCard = await addCard(trzListId, trlCardName, cardDesc, trlCardNumber, undefined);
            await moveCardToList(trzCard.id, trzListId, trlCardOrder);
            const trzLabelIds = trlCardLabelIds.map((trlLabelId) => labelMap[trlLabelId]);
            await setCardsLabels(trzCard.id, trzLabelIds);

            // Map Trello members to Terrazzo users
            for (const trelloMemberId of trelloCard.idMembers) {
                const trzUserId = userMap[trelloMemberId];
                if (trzUserId) {
                    await addAssigneeToCard(trzCard.id, trzUserId);
                }
            }

            const trelloCreatorId = trelloCard.idMemberCreator;
            const trzCreatorId = userMap[trelloCreatorId];

            await updateCardFromPartial(trzCard.id, {
                archived: trelloCard.closed,
                createdById: trzCreatorId,
                createdAt: trlCardCreatedDate.getTime(),
            });
        }

        return trzBoardId;
    } catch (error: any) {
        console.error('Error importing from trello', error);
        return undefined;
    }
};

/**
 * Given a markdown text, extracts all image URLs from it.
 * Images are in markdown format: ![alt text](image_url)
 */
const extractMarkdownImagesFromText = (text: string): string[] => {
    const imageUrls: string[] = [];
    const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = markdownImageRegex.exec(text)) !== null) {
        imageUrls.push(match[1]);
    }
    return imageUrls;
};
