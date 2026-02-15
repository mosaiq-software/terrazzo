import { LabelId, ModuleId } from '../../genericTypes';

export interface Label {
    id: LabelId;
    boardId: ModuleId;
    name: string;
    color: string;
}
