import {
    CollectionSource,
    CreateObjectSourceData,
    ObjectSource,
    UID,
    UpdateObjectSourceData,
} from '@mosaiq/terrazzo-common';
import { syncCollectionSource, syncObjectSource } from '@trz-api/broadcasters';
import {
    createObjectSource as createObjectSourceInternal,
    getCollectionHandler,
    getObjectHandler,
    readCollectionSource as readCollectionSourceInternal,
    readObjectSource as readObjectSourceInternal,
} from './dataSourceRegistry';

export const createObjectSource = async (create: CreateObjectSourceData): Promise<void> => {
    try {
        await createObjectSourceInternal(create);
    } catch (err) {
        console.error(`Error creating object source of type ${create.type}:`, err);
        throw err;
    }
};

export const updateObjectSource = async (objectId: UID, update: UpdateObjectSourceData): Promise<void> => {
    try {
        const handler = getObjectHandler(update.type);
        await handler.update(objectId, update.data);

        // Narrow the source type before calling the generic broadcaster.
        // This avoids constructing a discriminated-union payload from union-typed variables.
        switch (update.type) {
            case ObjectSource.Label:
                await syncObjectSource(objectId, ObjectSource.Label);
                break;
            case ObjectSource.Invite:
                await syncObjectSource(objectId, ObjectSource.Invite);
                break;
        }
    } catch (err) {
        console.error(`Error updating object source of type ${update.type} with id ${objectId}:`, err);
        throw err;
    }
};

export const readObjectSource = readObjectSourceInternal;

export const addToCollectionSource = async (
    collectionId: UID,
    itemIds: UID[],
    type: CollectionSource
): Promise<void> => {
    try {
        const handler = getCollectionHandler(type);
        await handler.add(collectionId, itemIds);

        switch (type) {
            case CollectionSource.Labels:
                await syncCollectionSource(collectionId, CollectionSource.Labels);
                break;
            case CollectionSource.LabelAssignments:
                await syncCollectionSource(collectionId, CollectionSource.LabelAssignments);
                break;
        }
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
        const handler = getCollectionHandler(type);
        await handler.remove(collectionId, itemIds);

        switch (type) {
            case CollectionSource.Labels:
                await syncCollectionSource(collectionId, CollectionSource.Labels);
                break;
            case CollectionSource.LabelAssignments:
                await syncCollectionSource(collectionId, CollectionSource.LabelAssignments);
                break;
        }
    } catch (err) {
        console.error(`Error removing item from collection source of type ${type} with id ${collectionId}:`, err);
        throw err;
    }
};

export const readCollectionSource = readCollectionSourceInternal;
