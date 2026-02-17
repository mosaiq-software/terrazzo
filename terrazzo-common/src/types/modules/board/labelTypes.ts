import { LabelId, ModuleId } from '../../genericTypes';

export interface LabelCreate {
    boardId: ModuleId;
    name: string;
    color: string;
}
export interface Label {
    id: LabelId;
    boardId: ModuleId;
    name: string;
    color: string;
}
