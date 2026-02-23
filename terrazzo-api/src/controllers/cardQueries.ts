import { CardId } from '@mosaiq/terrazzo-common';
import { getCardByIdDb } from '@trz-api/persistence/cardPersistence';

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
