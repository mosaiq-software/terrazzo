import { BoardId, CardId, LabelId, ListId } from '../../genericTypes';
import { ModuleHeader, TrzModuleType } from '../moduleTypes';
import { List } from './listTypes';

export interface Board extends ModuleHeader<TrzModuleType.Board> {
    lists: List[];
    labels: Label[];
}

export interface BoardRes extends Omit<Board, 'lists'> {
    lists: { listId: ListId; cardIds: CardId[] }[];
}

export interface Label {
    id: LabelId;
    boardId: BoardId;
    name: string;
    color: string;
}
