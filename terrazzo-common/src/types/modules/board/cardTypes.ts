import { Priority } from '../../../constants';
import { AssignmentId, CardId, ListId, ModuleId, TextBlockId, UserId } from '../../genericTypes';

export interface CardHeader {
    id: CardId;
    listId: ListId;
    boardId: ModuleId;
    cardNumber: number;
    name: string;
    priority: Priority | null;
    order: number | null;
    descriptionTextBlockId: TextBlockId;
    createdAt: number;
    createdById: UserId | null;
}

export interface CardAssignment {
    id: AssignmentId;
    userId: UserId;
    cardId: CardId;
}
