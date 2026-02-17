import { UID } from '../genericTypes';

export enum CollectionSource {
    LabelAssignments = 'LabelAssignments',
}

export interface CollectionSourceDataMap {
    [CollectionSource.LabelAssignments]: UID[];
}
