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
import { cardHandler } from './objectHandlers/card';
import { inviteHandler } from './objectHandlers/invite';
import { labelHandler } from './objectHandlers/label';
import { listHandler } from './objectHandlers/list';
import { moduleHandler } from './objectHandlers/module';
import { organizationHandler } from './objectHandlers/organization';
import { roleHandler } from './objectHandlers/role';
import { textBlockHandler } from './objectHandlers/textBlock';
import { textBlockSnapshotHandler } from './objectHandlers/textBlockSnapshot';
import { userHandler } from './objectHandlers/user';

const objectSourceController: ObjectSourceController = {
    [ObjectSource.Card]: cardHandler,
    [ObjectSource.List]: listHandler,
    [ObjectSource.Label]: labelHandler,
    [ObjectSource.Invite]: inviteHandler,
    [ObjectSource.Module]: moduleHandler,
    [ObjectSource.Organization]: organizationHandler,
    [ObjectSource.Role]: roleHandler,
    [ObjectSource.TextBlock]: textBlockHandler,
    [ObjectSource.TextBlockSnapshot]: textBlockSnapshotHandler,
    [ObjectSource.User]: userHandler,
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
