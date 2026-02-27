import { ListId, ModuleId } from '../../genericTypes';

export interface CreateList {
    boardId: ModuleId;
    name: string;
    order?: number;
}

export interface UpdateList {
    name?: string;
}

export interface List {
    id: ListId;
    boardId: ModuleId;
    name: string;
    order: number | null;
}
