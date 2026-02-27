import { LabelId } from '../genericTypes';

export enum CollectionSource {
    Labels = 'Labels',
    LabelAssignments = 'LabelAssignments',
}

export interface CollectionSourceDataMap {
    [CollectionSource.LabelAssignments]: {
        of: LabelId;
        editable: true;
    };
    [CollectionSource.Labels]: {
        of: LabelId;
        editable: false;
    };
}
