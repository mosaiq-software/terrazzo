import { CardId, LabelId, ListId, ModuleId } from '../../genericTypes';
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
    boardId: ModuleId;
    name: string;
    color: string;
}
