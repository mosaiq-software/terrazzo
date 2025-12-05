import { CardId, UserId } from '@mosaiq/terrazzo-common/types';
import { createCardAssignmentRecord, deleteCardAssignmentRecord, getCardAssignmentRecordsForUserOnCard } from '@trz-api/persistence/cardAssignmentPersistence';

export const addAssigneeToCard = async (cardId: CardId, userId: UserId) => {
    const existingAssignment = await getCardAssignmentRecordsForUserOnCard(userId, cardId);
    if (existingAssignment?.length) {
        return;
    }
    await createCardAssignmentRecord(userId, cardId);
};

export const removeAssigneeFromCard = async (cardId: CardId, userId: UserId) => {
    const existingAssignment = await getCardAssignmentRecordsForUserOnCard(userId, cardId);
    if (existingAssignment?.length) {
        await deleteCardAssignmentRecord(existingAssignment[0].id);
    }
};
