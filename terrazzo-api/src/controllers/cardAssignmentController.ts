import { CardId, UserId } from '@mosaiq/terrazzo-common';
import { syncUpdateCardAssignee } from '@trz-api/broadcasters';
import {
    cardAssignmentExistsDb,
    createCardAssignmentRecordDb,
    deleteCardAssignmentRecordDb,
} from '@trz-api/persistence/cardAssignmentPersistence';
import { getBoardIDFromCardID } from './cardQueries';

interface AddAssigneeToCardOptions {
    preventSync?: boolean;
}
export const addAssigneeToCard = async (cardId: CardId, userId: UserId, options?: AddAssigneeToCardOptions) => {
    const exists = await cardAssignmentExistsDb(userId, cardId);
    if (exists) {
        return;
    }
    await createCardAssignmentRecordDb(userId, cardId);

    if (!options?.preventSync) {
        const boardId = await getBoardIDFromCardID(cardId);
        await syncUpdateCardAssignee({ cardId, userId, assigned: true }, boardId);
    }
};

interface RemoveAssigneeFromCardOptions {
    preventSync?: boolean;
}
export const removeAssigneeFromCard = async (
    cardId: CardId,
    userId: UserId,
    options?: RemoveAssigneeFromCardOptions
) => {
    await deleteCardAssignmentRecordDb(userId, cardId);

    if (!options?.preventSync) {
        const boardId = await getBoardIDFromCardID(cardId);
        await syncUpdateCardAssignee({ cardId, userId, assigned: false }, boardId);
    }
};
