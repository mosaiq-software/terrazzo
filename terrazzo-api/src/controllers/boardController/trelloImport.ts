import { Block } from '@blocknote/core';
import {
    BoardId,
    CardId,
    DirectoryId,
    LabelId,
    ListId,
    TrelloCardType,
    TrelloChecklistType,
    TrelloExportType,
    TrelloLabelColorsMap,
    TrelloLabelType,
    TrelloListType,
    TrelloUserToTerrazzoUserMap,
    getFileUrl,
    settlePromises,
} from '@mosaiq/terrazzo-common';
import { getApiUrl } from '@trz-api/utils/envUtils';
import { extractMarkdownImagesFromText, replaceAllOccurrences } from '@trz-api/utils/textUtils';
import { addAssigneeToCard } from '../cardAssignmentController';
import { addCard, moveCard, setCardsLabels } from '../cardController';
import { saveFileFromUrl } from '../fileController';
import { addList, moveList } from '../listController';
import {
    getBlocknoteChecklistBlock,
    getBlocknoteMediaBlock,
    maybeParseMarkdownToBlocks,
} from '../textBlockController/blocknoteUtils';
import { addBoard, createBoardLabelSingle } from './boardController';

/**
 * Creates a Terrazzo board from a Trello board export
 * @param onParentId - The parent directory ID to create the board in
 * @param trelloBoard - The Trello board export data
 * @param userMap - A mapping of Trello user IDs to Terrazzo user IDs
 * @returns The created Terrazzo board ID, or undefined if creation failed
 */
export const createTerrazzoBoardFromTrelloBoard = async (
    onParentId: DirectoryId,
    trelloBoard: TrelloExportType,
    userMap: TrelloUserToTerrazzoUserMap
) => {
    try {
        const trzBoardId = await addBoard(trelloBoard.name, '', onParentId);
        const listMap = await createLists(trzBoardId, trelloBoard.lists);
        const labelMap = await createLabels(trzBoardId, trelloBoard.labels);
        const { cardCreatedDateMap } = getActionsData(trelloBoard);
        const cardChecklistsMap = getChecklistsForCards(trelloBoard.checklists);

        // Run these in sequence to ensure order is preserved, and nothing gets rate limited.
        // Creating hundreds of cards in parallel on the same board can lead to issues.
        for (const trelloCard of trelloBoard.cards) {
            await createCard(trelloCard, cardChecklistsMap, cardCreatedDateMap, listMap, labelMap, userMap);
        }

        return trzBoardId;
    } catch (error: any) {
        console.error('Error importing from trello', error);
        return undefined;
    }
};

/**
 * Creates Terrazzo lists from Trello lists
 */
const createLists = async (trzBoardId: BoardId, trelloLists: TrelloListType[]) => {
    const listMap: { [trl: string]: ListId } = {};
    for (const trelloList of trelloLists) {
        const trelloListName = trelloList.name;
        const trelloListOrder = trelloList.pos;

        const trzList = await addList(
            {
                boardId: trzBoardId,
                name: trelloListName,
                archived: trelloList.closed,
            },
            {
                preventSync: true,
            }
        );
        await moveList(trzList.id, trelloListOrder, trzBoardId, { preventSync: true });
        listMap[trelloList.id] = trzList.id;
    }
    return listMap;
};

/**
 * Creates Terrazzo labels from Trello labels
 */
const createLabels = async (trzBoardId: BoardId, trelloLabels: TrelloLabelType[]) => {
    const labelMap: { [trl: string]: LabelId } = {};
    for (const trelloLabel of trelloLabels) {
        const color = TrelloLabelColorsMap[trelloLabel.color] || TrelloLabelColorsMap['black'];
        const labelId = await createBoardLabelSingle(trzBoardId, trelloLabel.name, color);
        labelMap[trelloLabel.id] = labelId;
    }
    return labelMap;
};

/**
 * Extracts card creation dates from Trello actions
 */
const getActionsData = (trelloBoard: TrelloExportType) => {
    const cardCreatedDateMap: Record<string, Date> = {};
    for (const action of trelloBoard?.actions || []) {
        if (action.type === 'createCard') {
            const cardId = action.data.card.id;
            cardCreatedDateMap[cardId] = new Date(action.date);
        }
    }
    return { cardCreatedDateMap };
};

/**
 * Groups checklists by their associated card IDs
 */
const getChecklistsForCards = (checklists: TrelloChecklistType[]) => {
    const cardChecklistsMap: Record<string, TrelloChecklistType[]> = {};
    for (const checklist of checklists) {
        const cardId = checklist.idCard;
        if (!cardChecklistsMap[cardId]) {
            cardChecklistsMap[cardId] = [];
        }
        cardChecklistsMap[cardId].push(checklist);
    }
    return cardChecklistsMap;
};

/**
 * Creates a Terrazzo card from a Trello card
 */
const createCard = async (
    trelloCard: TrelloCardType,
    cardChecklistsMap: Record<string, TrelloChecklistType[]>,
    cardCreatedDateMap: Record<string, Date>,
    listMap: Record<string, ListId>,
    labelMap: Record<string, LabelId>,
    userMap: TrelloUserToTerrazzoUserMap
) => {
    const descriptionBlocks = await processCardDescription(trelloCard.desc);
    const attachmentBlocks = await processExtraCardAttachments(trelloCard);
    const checklistBlocks = processCardChecklists(cardChecklistsMap[trelloCard.id] || []);
    const allBlocks = [...descriptionBlocks, ...attachmentBlocks, ...checklistBlocks];

    const trzListId = listMap[trelloCard.idList];
    if (!trzListId) {
        console.error(`Skipping card because its list was not found`, {
            cardId: trelloCard.id,
            listId: trelloCard.idList,
        });
        throw new Error('List not found for card');
    }

    const trzCreatorId = userMap[trelloCard.idMemberCreator];
    const createdAt = cardCreatedDateMap[trelloCard.id]?.getTime() || Date.now();
    const trzCard = await addCard(
        {
            listId: trzListId,
            name: trelloCard.name,
            archived: trelloCard.closed,
            createdById: trzCreatorId,
            createdAt: createdAt,
            cardNumber: trelloCard.idShort,
        },
        {
            preventSync: true,
            descriptionBlocks: allBlocks,
        }
    );
    await moveCard(trzCard.id, trzListId, trelloCard.pos, { preventSync: true });
    const trzLabelIds = trelloCard.idLabels.map((trlLabelId) => labelMap[trlLabelId]);
    await setCardsLabels(trzCard.id, trzLabelIds, { preventSync: true });
    await processCardAssignments(trelloCard, userMap, trzCard.id);
};

/**
 * Processes the card description: copies images and converts markdown to blocks
 */
const processCardDescription = async (description: string): Promise<Block[]> => {
    let cardDesc = description;
    const embeddedImages = extractMarkdownImagesFromText(cardDesc);
    for (const imageUrl of embeddedImages) {
        try {
            const createdFileId = saveFileFromUrl(imageUrl);
            const terrazzoFileUrl = getFileUrl(createdFileId, getApiUrl());
            cardDesc = replaceAllOccurrences(cardDesc, imageUrl, terrazzoFileUrl);
        } catch (error) {
            console.error('Error saving file from Trello card description:', error);
        }
    }

    // Convert the markdown description to use blocknote
    const descriptionBlocks = await maybeParseMarkdownToBlocks(cardDesc);
    return descriptionBlocks;
};

/**
 * Processes extra attachments on the Trello card that are not already embedded in the description
 */
const processExtraCardAttachments = async (trelloCard: TrelloCardType): Promise<Block[]> => {
    // Copy over attachment images that are not already embedded in the description
    const blockPromises: Promise<Block | null>[] = trelloCard.attachments.map(async (att) => {
        if (!att.isUpload) {
            return null;
        }
        if (trelloCard.desc.includes(att.url)) {
            return null;
        }
        try {
            const createdFileId = saveFileFromUrl(att.url);
            const terrazzoFileUrl = getFileUrl(createdFileId, getApiUrl());
            const mediaBlock = getBlocknoteMediaBlock(terrazzoFileUrl, att.mimeType, att.name);
            return mediaBlock;
        } catch (error) {
            console.error('Error saving file from Trello card attachment:', error);
            return null;
        }
    });
    const { fulfilled } = await settlePromises(blockPromises);
    const blocks = fulfilled.filter((b) => b !== null);
    return blocks;
};

/**
 * Processes Trello checklists into Terrazzo checklist blocks
 */
const processCardChecklists = (checklists: TrelloChecklistType[]): Block[] => {
    const blocks: Block[] = [];
    for (const checklist of checklists) {
        const checklistItems: { text: string; checked: boolean }[] = [];
        for (const item of checklist.checkItems) {
            checklistItems.push({
                text: item.name,
                checked: item.state === 'complete',
            });
        }
        const checklistBlock = getBlocknoteChecklistBlock(checklist.name, checklistItems);
        blocks.push(checklistBlock);
    }
    return blocks;
};

/**
 * Processes card assignments by mapping Trello members to Terrazzo users
 */
const processCardAssignments = async (
    trelloCard: TrelloCardType,
    userMap: TrelloUserToTerrazzoUserMap,
    trzCardId: CardId
) => {
    const assigneePromises = trelloCard.idMembers.map(async (trelloMemberId) => {
        const trzUserId = userMap[trelloMemberId];
        if (trzUserId) {
            await addAssigneeToCard(trzCardId, trzUserId, { preventSync: true });
        }
    });
    await settlePromises(assigneePromises);
};
