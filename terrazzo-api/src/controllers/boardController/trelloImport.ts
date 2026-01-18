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
import { extractMarkdownImagesFromText, replaceFirstOccurrence } from '@trz-api/utils/textUtils';
import { addAssigneeToCard } from '../cardAssignmentController';
import { addCard, moveCardToList, setCardsLabels, updateCardFromPartial } from '../cardController';
import { saveFileFromUrl } from '../fileController';
import { addList, moveList, updateListFromPartial } from '../listController';
import {
    getBlocknoteChecklistBlock,
    getBlocknoteMediaBlock,
    maybeParseMarkdownToBlocks,
} from '../textBlockController/textBlockController';
import { addBoard, createBoardLabelSingle } from './boardController';

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

        const cardCreationPromises = trelloBoard.cards.map((trelloCard) =>
            createCard(trelloCard, cardChecklistsMap, cardCreatedDateMap, listMap, labelMap, userMap)
        );
        await settlePromises(cardCreationPromises);

        return trzBoardId;
    } catch (error: any) {
        console.error('Error importing from trello', error);
        return undefined;
    }
};

const createLists = async (trzBoardId: BoardId, trelloLists: TrelloListType[]) => {
    const listMap: { [trl: string]: ListId } = {};
    for (const trelloList of trelloLists) {
        const trelloListName = trelloList.name;
        const trelloListOrder = trelloList.pos;

        const trzList = await addList(trzBoardId, trelloListName);
        await moveList(trzList.id, trelloListOrder);
        await updateListFromPartial(trzList.id, { archived: trelloList.closed });
        listMap[trelloList.id] = trzList.id;
    }
    return listMap;
};

const createLabels = async (trzBoardId: BoardId, trelloLabels: TrelloLabelType[]) => {
    const labelMap: { [trl: string]: LabelId } = {};
    for (const trelloLabel of trelloLabels) {
        const color = TrelloLabelColorsMap[trelloLabel.color] || TrelloLabelColorsMap['black'];
        const labelId = await createBoardLabelSingle(trzBoardId, trelloLabel.name, color);
        labelMap[trelloLabel.id] = labelId;
    }
    return labelMap;
};

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

    const trzCard = await addCard(trzListId, trelloCard.name, allBlocks, trelloCard.idShort, undefined);
    await moveCardToList(trzCard.id, trzListId, trelloCard.pos);
    const trzLabelIds = trelloCard.idLabels.map((trlLabelId) => labelMap[trlLabelId]);
    await setCardsLabels(trzCard.id, trzLabelIds);

    const trelloCreatorId = trelloCard.idMemberCreator;
    const trzCreatorId = userMap[trelloCreatorId];

    await processCardAssignments(trelloCard, userMap, trzCard.id);

    await updateCardFromPartial(trzCard.id, {
        archived: trelloCard.closed,
        createdById: trzCreatorId,
        createdAt: cardCreatedDateMap[trelloCard.id].getTime() || Date.now(),
    });
};

const processCardDescription = async (description: string): Promise<Block[]> => {
    // Copy over each image in the card description to Terrazzo's storage
    let cardDesc = description;
    const embeddedImages = extractMarkdownImagesFromText(cardDesc);
    for (const imageUrl of embeddedImages) {
        try {
            const createdFile = await saveFileFromUrl(imageUrl);
            const terrazzoFileUrl = getFileUrl(createdFile.id, getApiUrl());
            cardDesc = replaceFirstOccurrence(cardDesc, imageUrl, terrazzoFileUrl);
        } catch (error) {
            console.error('Error saving file from Trello card description:', error);
        }
    }

    // Convert the markdown description to use blocknote
    const descriptionBlocks = await maybeParseMarkdownToBlocks(cardDesc);
    return descriptionBlocks;
};

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
            const createdFile = await saveFileFromUrl(att.url);
            const terrazzoFileUrl = getFileUrl(createdFile.id, getApiUrl());
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

const processCardChecklists = (checklists: TrelloChecklistType[]): Block[] => {
    // Copy over any checklists
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

const processCardAssignments = async (
    trelloCard: TrelloCardType,
    userMap: TrelloUserToTerrazzoUserMap,
    trzCardId: CardId
) => {
    // Map Trello members to Terrazzo users
    const assigneePromises = trelloCard.idMembers.map(async (trelloMemberId) => {
        const trzUserId = userMap[trelloMemberId];
        if (trzUserId) {
            await addAssigneeToCard(trzCardId, trzUserId);
        }
    });
    await settlePromises(assigneePromises);
};
