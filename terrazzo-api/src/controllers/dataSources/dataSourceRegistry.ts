import {
    CollectionSource,
    CollectionSourceDataInstance,
    CollectionSourceHandler,
    CreateObjectSourceData,
    ObjectSource,
    ObjectSourceDataInstance,
    ObjectSourceHandler,
    UID,
} from '@mosaiq/terrazzo-common';
import { labelAssignmentsCollectionHandler } from './collectionHandlers/labelAssignments';
import { labelsCollectionHandler } from './collectionHandlers/labels';
import { inviteHandler } from './objectHandlers/invite';
import { labelHandler } from './objectHandlers/label';

type ObjectSourceController = {
    [T in ObjectSource]: ObjectSourceHandler<T>;
};

type CollectionSourceController = {
    [T in CollectionSource]: CollectionSourceHandler<T>;
};

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

export const createObjectSource = async (create: CreateObjectSourceData): Promise<void> => {
    const handler = getObjectHandler(create.type);
    await handler.create(create.data);
};

export const readObjectSource = async <T extends ObjectSource>(
    objectId: UID,
    type: T
): Promise<ObjectSourceDataInstance<T> | undefined> => {
    const handler = getObjectHandler(type);
    return await handler.read(objectId);
};

export const readCollectionSource = async <T extends CollectionSource>(
    collectionId: UID,
    type: T
): Promise<CollectionSourceDataInstance<T> | undefined> => {
    const handler = getCollectionHandler(type);
    return await handler.read(collectionId);
};
