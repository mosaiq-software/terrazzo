import { BoardId, CardId, LabelId, ListId } from '../../genericTypes';
import { ModuleHeader, TrzModuleType } from '../moduleTypes';
import { List } from './listTypes';

export interface BoardHeader extends ModuleHeader {
    type: TrzModuleType.Board;
    boardCode: string;
}

export interface Board extends BoardHeader {
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
