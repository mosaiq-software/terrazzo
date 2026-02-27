import { CardId, LabelId, ListId, UserId } from '@mosaiq/terrazzo-common';
import { syncMovedCard } from '@trz-api/broadcasters';
import { syncCardLabels } from '@trz-api/broadcasters/labelBroadcaster';
import { getCardAssignmentsForCardDb } from '@trz-api/persistence/cardAssignmentPersistence';
import { moveCardDb } from '@trz-api/persistence/cardPersistence';
import { getLabelsOnCardDb, setLabelsOnCardDb } from '@trz-api/persistence/labelAssignmentPersistence';
import { addAssigneeToCard } from './cardAssignmentController';
import { getBoardIDFromCardID } from './cardQueries';
import { cardHandler } from './dataSources/objectHandlers/card';
import { getTextBlockAsBlocks } from './textBlockController/textBlockController';

/**
 * Duplicates a card including its description, assignments, and labels
 * Returns the new duplicated card
 * @param cardId The ID of the card to duplicate
 * @param createdById Optional user ID of the user creating the duplicate
 */
export async function duplicateCard(cardId: CardId, createdById?: UserId): Promise<CardId> {
    const existingCard = await cardHandler.read(cardId);
    if (!existingCard) {
        throw new Error('Error populating existing card');
    }

    const currentBlocks = await getTextBlockAsBlocks(existingCard.descriptionTextBlockId);
    const newCardId = await cardHandler.create({
        listId: existingCard.listId,
        name: existingCard.name + ' (Copy)',
        descriptionBlocks: currentBlocks,
        priority: existingCard.priority ?? undefined,
        createdAt: Date.now(),
        createdById: createdById ?? undefined,
    });

    try {
        const assignees = await getCardAssignmentsForCardDb(existingCard.id);
        for (const assignee of assignees) {
            await addAssigneeToCard(newCardId, assignee);
        }
    } catch (error: any) {
        throw new Error('Failed to add assignees to card ' + error.message);
    }

    try {
        const labels = await getLabelsOnCardDb(existingCard.id);
        await setCardsLabels(newCardId, labels);
    } catch (error: any) {
        throw new Error('Failed to add labels to card ' + error.message);
    }

    return newCardId;
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
        const card = await cardHandler.read(cardId);
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
