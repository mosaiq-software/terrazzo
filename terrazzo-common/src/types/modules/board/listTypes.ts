import { BoardId, ListId } from '../../genericTypes';
import { Card } from './cardTypes';

export interface ListHeader {
    id: ListId;
    boardId: BoardId;
    name: string;
    archived: boolean;
    order: number | null;
}

export interface List extends ListHeader {
    cards: Card[];
}
