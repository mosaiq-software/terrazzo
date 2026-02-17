import { ListId, ModuleId } from '../../genericTypes';

export interface ListHeader {
    id: ListId;
    boardId: ModuleId;
    name: string;
    order: number | null;
}
