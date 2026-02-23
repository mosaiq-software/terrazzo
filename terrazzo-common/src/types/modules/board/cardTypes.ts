import { Priority } from '../../../constants';
import { CardId, ListId, ModuleId, TextBlockId, UserId } from '../../genericTypes';

export interface CreateCard {
    id: CardId;
    listId: ListId;
    name: string;
    priority?: Priority;
    order?: number;
}

export interface UpdateCard {
    name?: string;
    priority?: Priority;
}

export interface Card {
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
