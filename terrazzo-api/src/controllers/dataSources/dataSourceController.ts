import {
    CollectionSource,
    CollectionSourceDataInstance,
    CollectionSourceHandler,
    CreateObjectSourceData,
    ObjectSource,
    ObjectSourceDataInstance,
    ObjectSourceHandler,
    UID,
    UpdateObjectSourceData,
} from '@mosaiq/terrazzo-common';
import { syncCollectionSource, syncObjectSource } from '@trz-api/broadcasters';
import { labelHandler } from './objectHandlers/label';

type ObjectSourceController = {
    [T in ObjectSource]: ObjectSourceHandler<T>;
};
type CollectionSourceController = {
    [T in CollectionSource]: CollectionSourceHandler<T>;
};

const objectSourceController: ObjectSourceController = {
    [ObjectSource.Label]: labelHandler,
};

const collectionSourceController: CollectionSourceController = {};

export const createObjectSource = async (create: CreateObjectSourceData): Promise<void> => {
    try {
        const handler = objectSourceController[create.type];
        await handler.create(create.data);
    } catch (err) {
        console.error(`Error creating object source of type ${create.type}:`, err);
        throw err;
    }
};

export const updateObjectSource = async (objectId: UID, update: UpdateObjectSourceData): Promise<void> => {
    try {
        const handler = objectSourceController[update.type];
        await handler.update(objectId, update.data);
        await syncObjectSource(objectId, update.type);
    } catch (err) {
        console.error(`Error updating object source of type ${update.type} with id ${objectId}:`, err);
        throw err;
    }
};

export const readObjectSource = async <T extends ObjectSource>(
    objectId: UID,
    type: T
): Promise<ObjectSourceDataInstance<T> | undefined> => {
    try {
        const handler = objectSourceController[type];
        return await handler.read(objectId);
    } catch (err) {
        console.error(`Error reading object source of type ${type} with id ${objectId}:`, err);
        throw err;
    }
};

export const addToCollectionSource = async (
    collectionId: UID,
    itemIds: UID[],
    type: CollectionSource
): Promise<void> => {
    try {
        const handler = collectionSourceController[type];
        await handler.add(collectionId, itemIds);
        await syncCollectionSource(collectionId, type);
    } catch (err) {
        console.error(`Error adding item to collection source of type ${type} with id ${collectionId}:`, err);
        throw err;
    }
};

export const removeFromCollectionSource = async (
    collectionId: UID,
    itemIds: UID[],
    type: CollectionSource
): Promise<void> => {
    try {
        const handler = collectionSourceController[type];
        await handler.remove(collectionId, itemIds);
        await syncCollectionSource(collectionId, type);
    } catch (err) {
        console.error(`Error removing item from collection source of type ${type} with id ${collectionId}:`, err);
        throw err;
    }
};

export const readCollectionSource = async <T extends CollectionSource>(
    collectionId: UID,
    type: T
): Promise<CollectionSourceDataInstance<T> | undefined> => {
    try {
        const handler = collectionSourceController[type];
        return await handler.read(collectionId);
    } catch (err) {
        console.error(`Error reading collection source of type ${type} with id ${collectionId}:`, err);
        throw err;
    }
};
