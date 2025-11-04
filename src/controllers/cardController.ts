import { createCardOnList, getCardById, getCardsByListIdDown, getCardsByListIdShortUp, getCardsByListIdUp, updateCard, updateCardList, updateCardOrder } from '@trz-api/persistence/cardPersistence';
import { getListById, getNextListOrder } from '@trz-api/persistence/listPersistence';
import { getBoardById, updateBoard } from '@trz-api/persistence/boardPersistence';
import { BoardId, Card, CardHeader, CardId, LabelId, ListId, TextBlockId, UserId } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { getAssignmentsForCard } from '@trz-api/persistence/assignmentPersistence';
import { addLabelToCard, deleteLabelsOnCard, getLabelsOnCard } from '@trz-api/persistence/labelPersistence';
import { createTextBlockWithEncodedData, createTextBlockWithPlaintext } from './textBlockController';
import { getUserById } from '@trz-api/persistence/userPersistence';
import { getTextBlockById } from '@trz-api/persistence/textBlockPersistence';
import { addAssigneeToCard } from './assignmentController';

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
    let cardHeaders = await getCardsByListIdShortUp(listID, archived);

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
    const cardHeaders = await getCardsByListIdShortUp(listID, archived);
    if (cardHeaders == null) {
        return [];
    }
    return cardHeaders.map((c) => c.id);
}

export async function getSingleFullCard(cardId: CardId): Promise<Card | undefined> {
    const cardHeader = await getCardById(cardId);
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
export async function addCard(listID: ListId, cardName: string, description?: string, explicitCardNumber?: number, createdById?: UserId) {
    //pull board from db with ID
    const updatingList = await getListById(listID);

    if (updatingList == null) {
        throw new Error('Board not found');
    }

    const board = await getBoardById(updatingList.boardId);

    if (board == null) {
        throw new Error('Board not found');
    }

    const cardUid = crypto.randomUUID();
    const newCard: Card = {
        id: cardUid,
        listId: listID,
        cardNumber: explicitCardNumber ?? board.totalCards + 1,
        name: cardName,
        descriptionTextBlockId: cardUid, // placeholder id
        priority: null,
        storyPoints: null,
        assignees: [],
        comments: [],
        labels: [],
        archived: false,
        order: await getNextCardOrder(listID),
        createdAt: Date.now(),
        createdById: createdById ?? null,
        createdBy: createdById ? await getUserById(createdById) : null,
    };
    try {
        const descBlock = await createTextBlockWithPlaintext(description);
        if (!descBlock) {
            throw new Error('Failed to create description text block');
        }
        newCard.descriptionTextBlockId = descBlock.id;
    } catch (error: any) {
        throw new Error('Failed to create description text block');
    }

    try {
        await createCardOnList(newCard, listID);
        board.totalCards++;
        await updateBoard(board);
        return newCard;
    } catch (e) {
        throw new Error('Failed to save Card' + e);
    }
}

/**
 * Duplicates a card including its description, assignments, and labels
 * Returns the new duplicated card
 * @param cardId The ID of the card to duplicate
 * @param createdById Optional user ID of the user creating the duplicate
 */
export async function duplicateCard(cardId: CardId, createdById?: UserId) {
    const existingCardHeader = await getCardById(cardId);
    if (!existingCardHeader) {
        throw new Error('Card not found');
    }

    const list = await getListById(existingCardHeader.listId);
    if (!list) {
        throw new Error('List not found');
    }
    const board = await getBoardById(list.boardId);
    if (!board) {
        throw new Error('Board not found');
    }

    const existingCard = (await populateCards([existingCardHeader]))[0];
    if (!existingCard) {
        throw new Error('Error populating existing card');
    }

    const newCardId = crypto.randomUUID();
    const newCard: Card = {
        id: newCardId,
        listId: list.id,
        cardNumber: board.totalCards + 1,
        name: existingCard.name + ' (Copy)',
        descriptionTextBlockId: newCardId, // placeholder id
        priority: existingCard.priority,
        storyPoints: existingCard.storyPoints,
        assignees: existingCard.assignees,
        comments: existingCard.comments,
        labels: existingCard.labels,
        archived: existingCard.archived,
        order: await getNextCardOrder(list.id),
        createdAt: Date.now(),
        createdById: createdById ?? null,
        createdBy: createdById ? await getUserById(createdById) : null,
    };

    try {
        const currentEncodedDesc = await getTextBlockById(existingCard.descriptionTextBlockId);
        let newTextBlockId: TextBlockId | undefined = undefined;
        if (currentEncodedDesc) {
            const descBlock = await createTextBlockWithEncodedData(currentEncodedDesc.text);
            if (!descBlock) {
                throw new Error('Failed to create description text block');
            }
            newTextBlockId = descBlock.id;
        } else {
            const description = '';
            const descBlock = await createTextBlockWithPlaintext(description);
            if (!descBlock) {
                throw new Error('Failed to create description text block');
            }
            newTextBlockId = descBlock.id;
        }
        newCard.descriptionTextBlockId = newTextBlockId;
    } catch (error: any) {
        throw new Error('Failed to create description text block ' + error.message);
    }

    try {
        await createCardOnList(newCard, list.id);
        board.totalCards++;
        await updateBoard(board);
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
        setCardsLabels(newCard.id, existingCard.labels);
    } catch (error: any) {
        throw new Error('Failed to add labels to card ' + error.message);
    }

    return newCard;
}

export async function updateCardFromPartial(cardId: CardId, partial: Partial<CardHeader>) {
    const updatingCard = await getCardById(cardId);
    if (updatingCard == null) {
        throw new Error('Card not found');
    }

    const updated = updateBaseFromPartial<CardHeader>(updatingCard, partial);
    try {
        await updateCard(updated);
    } catch (e: any) {
        throw new Error('Failed to update card ' + e);
    }
}

export const getNextCardOrder = async (listId: ListId) => {
    const card = await getCardsByListIdDown(listId);
    return card ? card.length + 1 : 1;
};

//Utils

export async function getListIDFromCardID(cardID: CardId) {
    const card = await getCardById(cardID);
    if (card == null) {
        throw new Error('Card not found');
    }
    return card.listId;
}

export async function getBoardIDFromCardID(cardID: CardId) {
    const card = await getCardById(cardID);
    if (card == null || !card.listId) {
        throw new Error('Card not found');
    }
    const list = await getListById(card.listId);
    if (list == null) {
        throw new Error('List not found');
    }
    return list.boardId;
}

/*
    Remove the card from its old list and move it to the new one at the position
*/
export async function moveCardToList(cardId: CardId, toListId: ListId, position?: number) {
    try {
        const card = await getCardById(cardId);
        if (!card) {
            throw new Error(`Card ${cardId} not found`);
        }
        let currentListCards = await getCardsByListIdShortUp(card.listId, false);
        if (!currentListCards) {
            throw new Error(`Current list ${card.listId} not found`);
        }
        let newListCards = await getCardsByListIdShortUp(toListId, false);

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
            promises.push(updateCardOrder(currentListCards[i].id, i));
        }
        if (toListId !== card.listId) {
            for (let i = 0; i < newListCards.length; i++) {
                newListCards[i].order = i;
                promises.push(updateCardOrder(newListCards[i].id, i));
            }
            promises.push(updateCardList(cardId, toListId));
        }
        await Promise.all(promises);
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
                assignees: await getAssignmentsForCard(c.id),
                labels: await getLabelsOnCard(c.id),
                createdBy: c.createdById ? await getUserById(c.createdById) : null,
                comments: [],
            };
            return cc;
        })
    );
};

export const setCardsLabels = async (cardId: CardId, labelIds: LabelId[]) => {
    await deleteLabelsOnCard(cardId);
    for (const labelId of labelIds) {
        addLabelToCard(labelId, cardId);
    }
};
