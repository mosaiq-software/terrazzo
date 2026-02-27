import {
    CollectionSource,
    CollectionSourceDataPayload,
    CollectionSourceKey,
    CollectionSourceOf,
    CreateObjectSourceData,
    EditableCollectionSource,
    ObjectSource,
    ObjectSourceDataPayload,
    UID,
    UpdateObjectSourceData,
} from '@mosaiq/terrazzo-common';
import { syncCollectionSource, syncObjectSource } from '@trz-api/broadcasters';
import { getCollectionHandler, getEditableCollectionHandler, getObjectHandler } from './dataSourceRegistry';

export const readObjectSource = async <T extends ObjectSource>(
    objectId: UID,
    type: T
): Promise<ObjectSourceDataPayload<T> | undefined> => {
    const handler = getObjectHandler(type);
    const data = await handler.read(objectId);
    if (!data) {
        return undefined;
    }
    return { type, data } as ObjectSourceDataPayload<T>;
};

export const readCollectionSource = async <T extends CollectionSource>(
    collectionId: CollectionSourceKey<T>,
    type: T
): Promise<CollectionSourceDataPayload<T> | undefined> => {
    const handler = getCollectionHandler(type);
    const data = await handler.read(collectionId);
    if (!data) {
        return undefined;
    }
    return {
        id: collectionId,
        type,
        data,
    } as CollectionSourceDataPayload<T>;
};

export const createObjectSource = async (create: CreateObjectSourceData): Promise<void> => {
    try {
        const handler = getObjectHandler(create.type);
        await handler.create(create.data);
    } catch (err) {
        console.error(`Error creating object source of type ${create.type}:`, err);
        throw err;
    }
};

export const updateObjectSource = async (objectId: UID, update: UpdateObjectSourceData): Promise<void> => {
    try {
        const handler = getObjectHandler(update.type);
        await handler.update(objectId, update.data);
        await syncObjectSource(objectId, update.type);
    } catch (err) {
        console.error(`Error updating object source of type ${update.type} with id ${objectId}:`, err);
        throw err;
    }
};

export const addToCollectionSource = async <T extends EditableCollectionSource>(
    collectionId: CollectionSourceKey<T>,
    itemIds: CollectionSourceOf<T>[],
    type: T
): Promise<void> => {
    try {
        const handler = getEditableCollectionHandler(type);
        await handler.add(collectionId, itemIds);
        await syncCollectionSource(collectionId, type);
    } catch (err) {
        console.error(`Error adding item to collection source of type ${type} with id ${collectionId}:`, err);
        throw err;
    }
};

export const removeFromCollectionSource = async <T extends EditableCollectionSource>(
    collectionId: CollectionSourceKey<T>,
    itemIds: CollectionSourceOf<T>[],
    type: T
): Promise<void> => {
    try {
        const handler = getEditableCollectionHandler(type);
        await handler.remove(collectionId, itemIds);
        await syncCollectionSource(collectionId, type);
    } catch (err) {
        console.error(`Error removing item from collection source of type ${type} with id ${collectionId}:`, err);
        throw err;
    }
};
