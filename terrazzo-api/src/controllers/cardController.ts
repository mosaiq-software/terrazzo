import { Block } from '@blocknote/core';
import { Card, CardHeader, CardId, LabelId, ListId, TextBlockId, UserId } from '@mosaiq/terrazzo-common';
import { syncAddCard, syncMovedCard, syncUpdateCardField } from '@trz-api/broadcasters';
import { syncCardLabels } from '@trz-api/broadcasters/labelBroadcaster';
import { getBoardByIdDb, updateBoardDb } from '@trz-api/persistence/boardPersistence';
import { getCardAssignmentsForCardDb } from '@trz-api/persistence/cardAssignmentPersistence';
import {
    createCardOnListDb,
    getCardByIdDb,
    getCardsByListIdDownDb,
    getCardsByListIdShortUpDb,
    moveCardDb,
    updateCardDb,
} from '@trz-api/persistence/cardPersistence';
import {
    addLabelToCardDb,
    deleteLabelsOnCardDb,
    getLabelsOnCardDb,
} from '@trz-api/persistence/labelAssignmentPersistence';
import { getListByIdDb } from '@trz-api/persistence/listPersistence';
import { addAssigneeToCard } from './cardAssignmentController';
import { createBlocknoteTextBlockWithBlocks, getTextBlockAsBlocks } from './textBlockController/textBlockController';
import { getUserHeader } from './userController';

export const MOVING_LIST_ORDER = -10000;
//Gets

/**
 * Gets all cards of a list by list ID
 * All cards are returned with all their labels, checklists, comments, and timesheet entries
 * Returns a promise of all cards in the list
 * @param listID
 * @param archived
 */
export async function getAllCardsOfList(listID: ListId, archived: boolean) {
    let cardHeaders = await getCardsByListIdShortUpDb(listID, archived);

    if (cardHeaders == null) {
        return [];
    }

    cardHeaders = cardHeaders.filter((c) => !c.archived);

    const cards = await populateCards(cardHeaders);

    try {
        return cards;
    } catch (e) {
        throw new Error('Failed to retrieve board' + e);
    }
}

export async function getCardIdsOnList(listID: ListId, archived: boolean): Promise<CardId[]> {
    const cardHeaders = await getCardsByListIdShortUpDb(listID, archived);
    if (cardHeaders == null) {
        return [];
    }
    return cardHeaders.map((c) => c.id);
}

export async function getSingleFullCard(cardId: CardId): Promise<Card | undefined> {
    const cardHeader = await getCardByIdDb(cardId);
    if (!cardHeader) {
        throw new Error('Card not found');
    }
    const card = ((await populateCards([cardHeader])) ?? [undefined])[0] ?? undefined;
    return card;
}

//Creates

interface CreateCardOptions {
    preventSync?: boolean;
    descriptionBlocks?: Block[];
}
/**
 * Adds an empty card to an existing list via the list ID
 * You must pass in the list ID and the card name
 * Returns the ID of the new card
 * @param listID
 * @param cardName
 */
export async function addCard(card: Partial<CardHeader> & { listId: ListId }, options?: CreateCardOptions) {
    //pull board from db with ID
    const updatingList = await getListByIdDb(card.listId);
    if (!updatingList) {
        throw new Error('Board not found');
    }

    const board = await getBoardByIdDb(updatingList.boardId);
    if (!board) {
        throw new Error('Board not found');
    }

    let descriptionTextBlockId: TextBlockId;
    try {
        const descBlock = await createBlocknoteTextBlockWithBlocks(options?.descriptionBlocks ?? []);
        if (!descBlock) {
            throw new Error('Failed to create description text block');
        }
        descriptionTextBlockId = descBlock.id;
    } catch (error: any) {
        throw new Error('Failed to create description text block');
    }

    const cardUid = crypto.randomUUID();
    const newCard: Card = {
        id: cardUid,
        listId: card.listId,
        boardId: board.id,
        cardNumber: card.cardNumber ?? board.totalCards + 1,
        name: card.name || '',
        descriptionTextBlockId: descriptionTextBlockId,
        priority: card.priority || null,
        storyPoints: card.storyPoints || null,
        archived: card.archived || false,
        order: card.order || (await getNextCardOrder(card.listId)),
        createdAt: card.createdAt || Date.now(),
        createdById: card.createdById || null,
        createdBy: card.createdById ? await getUserHeader(card.createdById) : undefined,
        assignees: [],
        labels: [],
    };

    try {
        await createCardOnListDb(newCard);
        await updateBoardDb(board.id, { totalCards: board.totalCards + 1 });
    } catch (e) {
        throw new Error('Failed to save Card' + e);
    }
    if (!options?.preventSync) {
        try {
            await syncAddCard(newCard, board.id);
        } catch (e) {
            throw new Error('Failed to sync Card' + e);
        }
    }
    return newCard;
}

/**
 * Duplicates a card including its description, assignments, and labels
 * Returns the new duplicated card
 * @param cardId The ID of the card to duplicate
 * @param createdById Optional user ID of the user creating the duplicate
 */
export async function duplicateCard(cardId: CardId, createdById?: UserId) {
    const existingCardHeader = await getCardByIdDb(cardId);
    if (!existingCardHeader) {
        throw new Error('Card not found');
    }

    const list = await getListByIdDb(existingCardHeader.listId);
    if (!list) {
        throw new Error('List not found');
    }
    const board = await getBoardByIdDb(list.boardId);
    if (!board) {
        throw new Error('Board not found');
    }

    const existingCard = (await populateCards([existingCardHeader]))[0];
    if (!existingCard) {
        throw new Error('Error populating existing card');
    }

    let descriptionTextBlockId: TextBlockId;
    try {
        const currentBlocks = await getTextBlockAsBlocks(existingCard.descriptionTextBlockId);
        const descBlock = await createBlocknoteTextBlockWithBlocks(currentBlocks ?? []);
        if (!descBlock) {
            throw new Error('Failed to create description text block');
        }
        descriptionTextBlockId = descBlock.id;
    } catch (error: any) {
        throw new Error('Failed to create description text block ' + error.message);
    }

    const newCardId = crypto.randomUUID();
    const newCard: Card = {
        id: newCardId,
        listId: list.id,
        boardId: board.id,
        cardNumber: board.totalCards + 1,
        name: existingCard.name + ' (Copy)',
        descriptionTextBlockId: descriptionTextBlockId,
        priority: existingCard.priority,
        storyPoints: existingCard.storyPoints,
        assignees: existingCard.assignees,
        labels: existingCard.labels,
        archived: existingCard.archived,
        order: await getNextCardOrder(list.id),
        createdAt: Date.now(),
        createdById: createdById ?? null,
        createdBy: createdById ? await getUserHeader(createdById) : undefined,
    };

    try {
        await createCardOnListDb(newCard);
        await updateBoardDb(board.id, { totalCards: board.totalCards + 1 });
    } catch (e) {
        throw new Error('Failed to save Card' + e);
    }

    try {
        for (const assignee of existingCard.assignees) {
            await addAssigneeToCard(newCard.id, assignee);
        }
    } catch (error: any) {
        throw new Error('Failed to add assignees to card ' + error.message);
    }

    try {
        await setCardsLabels(newCard.id, existingCard.labels);
    } catch (error: any) {
        throw new Error('Failed to add labels to card ' + error.message);
    }

    try {
        await syncAddCard(newCard, board.id);
    } catch (e) {
        throw new Error('Failed to sync new card ' + e);
    }

    return newCard;
}

export async function updateCardFromPartial(cardId: CardId, partial: Partial<CardHeader>) {
    try {
        await updateCardDb({ id: cardId, ...partial });
    } catch (e: any) {
        throw new Error('Failed to update card ' + e);
    }
    try {
        const card = await getCardByIdDb(cardId);
        if (!card) {
            throw new Error('Card not found after update ' + cardId);
        }
        await syncUpdateCardField(card, card.boardId);
    } catch (e) {
        throw new Error('Failed to sync updated card ' + e);
    }
}

export const getNextCardOrder = async (listId: ListId) => {
    const cards = await getCardsByListIdDownDb(listId);
    return cards.length;
};

export async function getListIDFromCardID(cardID: CardId) {
    const card = await getCardByIdDb(cardID);
    if (card == null) {
        throw new Error('Card not found');
    }
    return card.listId;
}

export async function getBoardIDFromCardID(cardID: CardId) {
    const card = await getCardByIdDb(cardID);
    if (card == null || !card.boardId) {
        throw new Error('Card not found');
    }
    return card.boardId;
}

interface MoveCardOptions {
    preventSync?: boolean;
}
/*
 * Remove the card from its old list and move it to the new one at the position
 */
export async function moveCard(cardId: CardId, toListId: ListId, toPosition?: number, options?: MoveCardOptions) {
    try {
        const card = await getCardByIdDb(cardId);
        if (!card) {
            throw new Error(`Card ${cardId} not found`);
        }
        if (card.archived) {
            return;
        }

        if (toPosition === undefined) {
            toPosition = await getNextCardOrder(toListId);
        }

        await moveCardDb(cardId, toPosition, toListId);

        if (!options?.preventSync) {
            const boardId = card.boardId;
            await syncMovedCard({ cardId, toList: toListId, position: toPosition }, boardId);
        }
    } catch (error: any) {
        console.error(`Error moving card ${cardId} to list ${toListId}: ${error}`);
        throw error;
    }
}

export const populateCards = async (cardHeaders: CardHeader[]): Promise<Card[]> => {
    return await Promise.all(
        cardHeaders.map(async (c: CardHeader) => {
            const cc: Card = {
                ...c,
                assignees: await getCardAssignmentsForCardDb(c.id),
                labels: await getLabelsOnCardDb(c.id),
                createdBy: c.createdById ? await getUserHeader(c.createdById) : undefined,
            };
            return cc;
        })
    );
};

interface SetCardsLabelsOptions {
    preventSync?: boolean;
}
export const setCardsLabels = async (cardId: CardId, labelIds: LabelId[], options?: SetCardsLabelsOptions) => {
    await deleteLabelsOnCardDb(cardId);
    for (const labelId of labelIds) {
        addLabelToCardDb(labelId, cardId);
    }
    if (!options?.preventSync) {
        const boardId = await getBoardIDFromCardID(cardId);
        await syncCardLabels(boardId, cardId, labelIds);
    }
};
