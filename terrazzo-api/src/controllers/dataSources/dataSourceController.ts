import {
    CollectionSource,
    CollectionSourceHandler,
    CreateObjectSourceData,
    ObjectSource,
    ObjectSourceHandler,
    UID,
    UpdateObjectSourceData,
} from '@mosaiq/terrazzo-common';
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

export const createObjectSource = async (create: CreateObjectSourceData) => {
    try {
        const handler = objectSourceController[create.type];
        await handler.create(create.data);
    } catch (err) {
        console.error(`Error creating object source of type ${create.type}:`, err);
        throw err;
    }
};

export const updateObjectSource = async (id: UID, update: UpdateObjectSourceData) => {
    try {
        const handler = objectSourceController[update.type];
        await handler.update(id, update.data);
        // TODO sync
    } catch (err) {
        console.error(`Error updating object source of type ${update.type} with id ${id}:`, err);
        throw err;
    }
};

export const readObjectSource = async (id: UID, type: ObjectSource) => {
    try {
        const handler = objectSourceController[type];
        return await handler.read(id);
    } catch (err) {
        console.error(`Error reading object source of type ${type} with id ${id}:`, err);
        throw err;
    }
};

export const addToCollectionSource = async (id: UID, itemId: UID, type: CollectionSource) => {
    try {
        const handler = collectionSourceController[type];
        await handler.add(id, itemId);
        // TODO sync
    } catch (err) {
        console.error(`Error adding item to collection source of type ${type} with id ${id}:`, err);
        throw err;
    }
};

export const removeFromCollectionSource = async (id: UID, itemId: UID, type: CollectionSource) => {
    try {
        const handler = collectionSourceController[type];
        await handler.remove(id, itemId);
        // TODO sync
    } catch (err) {
        console.error(`Error removing item from collection source of type ${type} with id ${id}:`, err);
        throw err;
    }
};

export const readCollectionSource = async (id: UID, type: CollectionSource) => {
    try {
        const handler = collectionSourceController[type];
        return await handler.read(id);
    } catch (err) {
        console.error(`Error reading collection source of type ${type} with id ${id}:`, err);
        throw err;
    }
};
