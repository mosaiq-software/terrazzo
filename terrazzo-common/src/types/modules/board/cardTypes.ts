import { Block } from '@blocknote/core';
import { Priority } from '../../../constants';
import { CardId, ListId, ModuleId, TextBlockId, UserId } from '../../genericTypes';

export interface CreateCard {
    listId: ListId;
    name: string;
    cardNumber?: number;
    priority?: Priority;
    order?: number;
    descriptionBlocks?: Block[];
    createdAt?: number;
    createdById?: UserId;
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
