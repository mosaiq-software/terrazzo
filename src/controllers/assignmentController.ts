import { CardId, UserId } from "@mosaiq/terrazzo-common/types";
import { createAssignmentRecord, deleteAssignmentRecord, getAssignmentRecordsForUserOnCard } from "@trz-api/persistence/assignmentPersistence";


export const addAssigneeToCard = async (cardId:CardId, userId:UserId) => {
    const existingAssignment = await getAssignmentRecordsForUserOnCard(userId, cardId);
    if(existingAssignment?.length){
        return;
    }
    await createAssignmentRecord(userId, cardId);
}

export const removeAssigneeFromCard = async (cardId:CardId, userId:UserId) => {
    const existingAssignment = await getAssignmentRecordsForUserOnCard(userId, cardId);
    if(existingAssignment?.length){
        await deleteAssignmentRecord(existingAssignment[0].id);
    }
}