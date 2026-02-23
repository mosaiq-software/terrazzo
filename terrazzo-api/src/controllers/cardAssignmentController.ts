import { CardId, UserId } from '@mosaiq/terrazzo-common';
import { syncUpdateCardAssignee } from '@trz-api/broadcasters';
import {
    createCardAssignmentRecordDb,
    deleteCardAssignmentRecordDb,
    getCardAssignmentRecordsForUserOnCardDb,
} from '@trz-api/persistence/cardAssignmentPersistence';
import { getBoardIDFromCardID } from './cardQueries';

interface AddAssigneeToCardOptions {
    preventSync?: boolean;
}
export const addAssigneeToCard = async (cardId: CardId, userId: UserId, options?: AddAssigneeToCardOptions) => {
    const existingAssignment = await getCardAssignmentRecordsForUserOnCardDb(userId, cardId);
    if (existingAssignment?.length) {
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
    const existingAssignment = await getCardAssignmentRecordsForUserOnCardDb(userId, cardId);
    if (existingAssignment?.length) {
        await deleteCardAssignmentRecordDb(existingAssignment[0].id);
    }

    if (!options?.preventSync) {
        const boardId = await getBoardIDFromCardID(cardId);
        await syncUpdateCardAssignee({ cardId, userId, assigned: false }, boardId);
    }
};
