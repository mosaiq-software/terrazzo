import { Priority } from '../../../constants';
import { AssignmentId, CardId, LabelId, ListId, ModuleId, TextBlockId, UserId } from '../../genericTypes';

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

export interface Card extends CardHeader {
    labels: LabelId[];
    assignees: UserId[];
}

export interface CardAssignment {
    id: AssignmentId;
    userId: UserId;
    cardId: CardId;
}
