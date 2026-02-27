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
    const handler = getObjectHandler(create.type);
    await handler.create(create.data);
};

export const updateObjectSource = async (objectId: UID, update: UpdateObjectSourceData): Promise<void> => {
    const handler = getObjectHandler(update.type);
    await handler.update(objectId, update.data);
};

export const addToCollectionSource = async <T extends EditableCollectionSource>(
    collectionId: CollectionSourceKey<T>,
    itemIds: CollectionSourceOf<T>[],
    type: T
): Promise<void> => {
    const handler = getEditableCollectionHandler(type);
    await handler.add(collectionId, itemIds);
};

export const removeFromCollectionSource = async <T extends EditableCollectionSource>(
    collectionId: CollectionSourceKey<T>,
    itemIds: CollectionSourceOf<T>[],
    type: T
): Promise<void> => {
    const handler = getEditableCollectionHandler(type);
    await handler.remove(collectionId, itemIds);
};
