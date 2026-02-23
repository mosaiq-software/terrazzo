import { AssignmentId, CardId, UserId } from '../../genericTypes';

export interface CardAssignment {
    id: AssignmentId;
    userId: UserId;
    cardId: CardId;
}
