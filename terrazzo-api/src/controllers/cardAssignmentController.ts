import { CardId, UserId } from '@mosaiq/terrazzo-common';
import { createCardAssignmentRecordDb, deleteCardAssignmentRecordDb, getCardAssignmentRecordsForUserOnCardDb } from '@trz-api/persistence/cardAssignmentPersistence';

export const addAssigneeToCard = async (cardId: CardId, userId: UserId) => {
    const existingAssignment = await getCardAssignmentRecordsForUserOnCardDb(userId, cardId);
    if (existingAssignment?.length) {
        return;
    }
    await createCardAssignmentRecordDb(userId, cardId);
};

export const removeAssigneeFromCard = async (cardId: CardId, userId: UserId) => {
    const existingAssignment = await getCardAssignmentRecordsForUserOnCardDb(userId, cardId);
    if (existingAssignment?.length) {
        await deleteCardAssignmentRecordDb(existingAssignment[0].id);
    }
};
