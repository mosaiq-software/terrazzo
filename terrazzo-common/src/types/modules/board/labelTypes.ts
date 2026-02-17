import { LabelId, ModuleId } from '../../genericTypes';

export interface CreateLabel {
    boardId: ModuleId;
    name: string;
    color: string;
}

export interface UpdateLabel {
    name?: string;
    color?: string;
}

export interface Label {
    id: LabelId;
    boardId: ModuleId;
    name: string;
    color: string;
}
