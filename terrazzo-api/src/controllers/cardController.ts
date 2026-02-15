import { Block } from '@blocknote/core';
import { Card, CardHeader, CardId, LabelId, ListId, TextBlockId, TrzModuleType, UserId } from '@mosaiq/terrazzo-common';
import { syncAddCard, syncMovedCard, syncUpdateCardField } from '@trz-api/broadcasters';
import { syncCardLabels } from '@trz-api/broadcasters/labelBroadcaster';
import { getCardAssignmentsForCardDb } from '@trz-api/persistence/cardAssignmentPersistence';
import {
    createCardOnListDb,
    getCardByIdDb,
    getCardCountOnListDb,
    getTotalCardCountOnBoardDb,
    moveCardDb,
    updateCardDb,
} from '@trz-api/persistence/cardPersistence';
import { getLabelsOnCardDb, setLabelsOnCardDb } from '@trz-api/persistence/labelAssignmentPersistence';
import { getListByIdDb } from '@trz-api/persistence/listPersistence';
import { addAssigneeToCard } from './cardAssignmentController';
import { getModuleById } from './moduleController';
import { createBlocknoteTextBlockWithBlocks, getTextBlockAsBlocks } from './textBlockController/textBlockController';

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
        throw new Error('List not found');
    }

    const board = await getModuleById(updatingList.boardId, TrzModuleType.Board);
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

    const cardsOnBoard = await getTotalCardCountOnBoardDb(board.id);

    const cardUid = crypto.randomUUID();
    const newCard: Card = {
        id: cardUid,
        listId: card.listId,
        boardId: board.id,
        cardNumber: card.cardNumber ?? cardsOnBoard + 1,
        name: card.name || '',
        descriptionTextBlockId: descriptionTextBlockId,
        priority: card.priority || null,
        order: card.order !== undefined ? card.order : await getCardCountOnListDb(card.listId),
        createdAt: card.createdAt || Date.now(),
        createdById: card.createdById || null,
        assignees: [],
        labels: [],
    };

    try {
        await createCardOnListDb(newCard);
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
    const existingCard = await getSingleFullCard(cardId);
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

    const cardsOnBoard = await getTotalCardCountOnBoardDb(existingCard.boardId);

    const newCardId = crypto.randomUUID();
    const newCard: Card = {
        id: newCardId,
        listId: existingCard.listId,
        boardId: existingCard.boardId,
        cardNumber: cardsOnBoard + 1,
        name: existingCard.name + ' (Copy)',
        descriptionTextBlockId: descriptionTextBlockId,
        priority: existingCard.priority,
        assignees: existingCard.assignees,
        labels: existingCard.labels,
        order: await getCardCountOnListDb(existingCard.listId),
        createdAt: Date.now(),
        createdById: createdById ?? null,
    };

    try {
        await createCardOnListDb(newCard);
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
        await syncAddCard(newCard, existingCard.boardId);
    } catch (e) {
        throw new Error('Failed to sync new card ' + e);
    }

    return newCard;
}

export async function updateCardFromPartial(cardId: CardId, partial: Partial<CardHeader>) {
    try {
        if (partial.order !== undefined) {
            // Do not update order directly
            delete partial.order;
        }
        if (partial.listId !== undefined) {
            // Do not update listId directly
            delete partial.listId;
        }
        await updateCardDb(cardId, partial);
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
export async function moveCard(
    cardId: CardId,
    toListId: ListId,
    toPosition?: number | null,
    options?: MoveCardOptions
) {
    try {
        const card = await getCardByIdDb(cardId);
        if (!card) {
            throw new Error(`Card ${cardId} not found`);
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
                labels: (await getLabelsOnCardDb(c.id)) || [],
            };
            return cc;
        })
    );
};

interface SetCardsLabelsOptions {
    preventSync?: boolean;
}
export const setCardsLabels = async (cardId: CardId, labelIds: LabelId[], options?: SetCardsLabelsOptions) => {
    await setLabelsOnCardDb(cardId, labelIds);
    if (!options?.preventSync) {
        const boardId = await getBoardIDFromCardID(cardId);
        await syncCardLabels(boardId, cardId, labelIds);
    }
};
