import { Block } from '@blocknote/core';
import {
    Card,
    CardHeader,
    CardId,
    LabelId,
    ListId,
    TextBlockId,
    updateBaseFromPartial,
    UserId,
} from '@mosaiq/terrazzo-common';
import { syncAddCard, syncMovedCard, syncUpdateCardField } from '@trz-api/broadcasters';
import { syncCardLabels } from '@trz-api/broadcasters/labelBroadcaster';
import { getBoardByIdDb, updateBoardDb } from '@trz-api/persistence/boardPersistence';
import { getCardAssignmentsForCardDb } from '@trz-api/persistence/cardAssignmentPersistence';
import {
    createCardOnListDb,
    getCardByIdDb,
    getCardsByListIdDownDb,
    getCardsByListIdShortUpDb,
    updateCardDb,
    updateCardListDb,
    updateCardOrderDb,
} from '@trz-api/persistence/cardPersistence';
import { getListByIdDb } from '@trz-api/persistence/listPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';
import { addAssigneeToCard } from './cardAssignmentController';
import { getBoardIDFromListID } from './listController';
import { createBlocknoteTextBlockWithBlocks, getTextBlockAsBlocks } from './textBlockController/textBlockController';
import {
    getLabelsOnCardDb,
    deleteLabelsOnCardDb,
    addLabelToCardDb,
} from '@trz-api/persistence/labelAssignmentPersistence';

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

/**
 * Adds an empty card to an existing list via the list ID
 * You must pass in the list ID and the card name
 * Returns the ID of the new card
 * @param listID
 * @param cardName
 */
export async function addCard(
    listID: ListId,
    cardName: string,
    descriptionBlocks: Block[] = [],
    explicitCardNumber?: number,
    createdById?: UserId
) {
    //pull board from db with ID
    const updatingList = await getListByIdDb(listID);

    if (updatingList == null) {
        throw new Error('Board not found');
    }

    const board = await getBoardByIdDb(updatingList.boardId);

    if (board == null) {
        throw new Error('Board not found');
    }

    let descriptionTextBlockId: TextBlockId;
    try {
        const descBlock = await createBlocknoteTextBlockWithBlocks(descriptionBlocks);
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
        listId: listID,
        boardId: board.id,
        cardNumber: explicitCardNumber ?? board.totalCards + 1,
        name: cardName,
        descriptionTextBlockId: descriptionTextBlockId,
        priority: null,
        storyPoints: null,
        assignees: [],
        labels: [],
        archived: false,
        order: await getNextCardOrder(listID),
        createdAt: Date.now(),
        createdById: createdById ?? null,
        createdBy: createdById ? await getUserHeaderByIdDb(createdById) : undefined,
    };

    try {
        await createCardOnListDb(newCard);
        await updateBoardDb(board.id, { totalCards: board.totalCards + 1 });
        await syncAddCard(newCard, board.id);
    } catch (e) {
        throw new Error('Failed to save Card' + e);
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
        createdBy: createdById ? await getUserHeaderByIdDb(createdById) : undefined,
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
    const updatingCard = await getCardByIdDb(cardId);
    if (updatingCard == null) {
        throw new Error('Card not found');
    }

    const updated = updateBaseFromPartial(updatingCard, partial);
    try {
        await updateCardDb(updated);
    } catch (e: any) {
        throw new Error('Failed to update card ' + e);
    }

    try {
        const boardId = await getBoardIDFromListID(updated.listId);
        await syncUpdateCardField(updated, boardId);
    } catch (e) {
        throw new Error('Failed to sync updated card ' + e);
    }
}

export const getNextCardOrder = async (listId: ListId) => {
    const card = await getCardsByListIdDownDb(listId);
    return card ? card.length + 1 : 1;
};

//Utils

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

/*
    Remove the card from its old list and move it to the new one at the position
*/
export async function moveCardToList(cardId: CardId, toListId: ListId, position?: number) {
    try {
        const card = await getCardByIdDb(cardId);
        if (!card) {
            throw new Error(`Card ${cardId} not found`);
        }
        let currentListCards = await getCardsByListIdShortUpDb(card.listId, false);
        if (!currentListCards) {
            throw new Error(`Current list ${card.listId} not found`);
        }
        let newListCards = await getCardsByListIdShortUpDb(toListId, false);

        currentListCards = currentListCards.filter((c) => c.id !== cardId);

        if (card.listId === toListId) {
            newListCards = currentListCards;
        }
        if (!newListCards) {
            throw new Error(`New list ${toListId} not found`);
        }

        if (position !== undefined) {
            newListCards.splice(position, 0, card);
        } else {
            newListCards.push(card);
        }

        const promises = [];
        for (let i = 0; i < currentListCards.length; i++) {
            currentListCards[i].order = i;
            promises.push(updateCardOrderDb(currentListCards[i].id, i));
        }
        if (toListId !== card.listId) {
            for (let i = 0; i < newListCards.length; i++) {
                newListCards[i].order = i;
                promises.push(updateCardOrderDb(newListCards[i].id, i));
            }
            promises.push(updateCardListDb(cardId, toListId));
        }
        await Promise.all(promises);
        const boardId = await getBoardIDFromListID(toListId);
        await syncMovedCard({ cardId, toList: toListId, position }, boardId);
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
                createdBy: c.createdById ? await getUserHeaderByIdDb(c.createdById) : undefined,
            };
            return cc;
        })
    );
};

export const setCardsLabels = async (cardId: CardId, labelIds: LabelId[]) => {
    await deleteLabelsOnCardDb(cardId);
    for (const labelId of labelIds) {
        addLabelToCardDb(labelId, cardId);
    }
    const boardId = await getBoardIDFromCardID(cardId);
    await syncCardLabels(boardId, cardId, labelIds);
};
