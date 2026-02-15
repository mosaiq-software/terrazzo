import { ListId, ModuleId } from '../../genericTypes';
import { Card } from './cardTypes';

export interface ListHeader {
    id: ListId;
    boardId: ModuleId;
    name: string;
    order: number | null;
}

export interface List extends ListHeader {
    cards: Card[];
}
