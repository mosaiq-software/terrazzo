import {
    CollectionSource,
    CollectionSourceController,
    CollectionSourceHandler,
    ObjectSource,
    ObjectSourceController,
    ObjectSourceHandler,
} from '@mosaiq/terrazzo-common';
import { labelAssignmentsCollectionHandler } from './collectionHandlers/labelAssignments';
import { labelsCollectionHandler } from './collectionHandlers/labels';
import { inviteHandler } from './objectHandlers/invite';
import { labelHandler } from './objectHandlers/label';

const objectSourceController: ObjectSourceController = {
    [ObjectSource.Label]: labelHandler,
    [ObjectSource.Invite]: inviteHandler,
};

const collectionSourceController: CollectionSourceController = {
    [CollectionSource.Labels]: labelsCollectionHandler,
    [CollectionSource.LabelAssignments]: labelAssignmentsCollectionHandler,
};

export const getObjectHandler = <T extends ObjectSource>(type: T): ObjectSourceHandler<T> => {
    return objectSourceController[type];
};

export const getCollectionHandler = <T extends CollectionSource>(type: T): CollectionSourceHandler<T> => {
    return collectionSourceController[type];
};
