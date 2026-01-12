import { CardId, UserId } from '@mosaiq/terrazzo-common';
import { syncUpdateCardAssignee } from '@trz-api/broadcasters';
import {
    createCardAssignmentRecordDb,
    deleteCardAssignmentRecordDb,
    getCardAssignmentRecordsForUserOnCardDb,
} from '@trz-api/persistence/cardAssignmentPersistence';
import { getBoardIDFromCardID } from './cardController';

export const addAssigneeToCard = async (cardId: CardId, userId: UserId) => {
    const existingAssignment = await getCardAssignmentRecordsForUserOnCardDb(userId, cardId);
    if (existingAssignment?.length) {
        return;
    }
    const boardId = await getBoardIDFromCardID(cardId);
    await createCardAssignmentRecordDb(userId, cardId);
    await syncUpdateCardAssignee({ cardId, userId, assigned: true }, boardId);
};

export const removeAssigneeFromCard = async (cardId: CardId, userId: UserId) => {
    const existingAssignment = await getCardAssignmentRecordsForUserOnCardDb(userId, cardId);
    if (existingAssignment?.length) {
        await deleteCardAssignmentRecordDb(existingAssignment[0].id);
    }
    const boardId = await getBoardIDFromCardID(cardId);
    await syncUpdateCardAssignee({ cardId, userId, assigned: false }, boardId);
};
