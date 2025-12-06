import { Priority, StoryPoints } from '../../../constants';
import { AssignmentId, CardId, LabelId, ListId, TextBlockId, UserId } from '../../genericTypes';
import { UserHeader } from '../../userTypes';

export interface CardHeader {
    id: CardId;
    listId: ListId;
    cardNumber: number;
    name: string;
    priority: Priority | null;
    storyPoints: StoryPoints | null;
    archived: boolean;
    order: number;
    descriptionTextBlockId: TextBlockId;
    createdAt: number;
    createdById: UserId | null;
}

export interface Card extends CardHeader {
    labels: LabelId[];
    assignees: UserId[];
    createdBy: UserHeader | undefined;
}

export interface CardAssignment {
    id: AssignmentId;
    userId: UserId;
    cardId: CardId;
}
