import {
    ClientSE,
    CollectionSource,
    CollectionSourceDataInstance,
    CreateObjectSourceData,
    EditableCollectionSource,
    ObjectSource,
    ObjectSourceDataInstance,
    UID,
    UpdateObjectSourceData,
} from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const readObjectSource = async <T extends ObjectSource>(
    sockCtx: SocketContextType,
    objectId: UID,
    type: T
): Promise<ObjectSourceDataInstance<T> | undefined> => {
    const data = await sockCtx.emit(ClientSE.READ_OBJECT_SOURCE, {
        id: objectId,
        source: type,
    });
    if (!data) {
        return undefined;
    }
    if (data.type !== type) {
        throw new Error(`Received object source data of type ${data.type} but expected type ${type}`);
    }
    return data.data;
};

export const createObjectSource = async (sockCtx: SocketContextType, data: CreateObjectSourceData): Promise<void> => {
    await sockCtx.emit(ClientSE.CREATE_OBJECT_SOURCE, { data });
};

export const updateObjectSource = async (
    sockCtx: SocketContextType,
    id: UID,
    data: UpdateObjectSourceData
): Promise<void> => {
    await sockCtx.emit(ClientSE.UPDATE_OBJECT_SOURCE, { id, data });
};

export const readCollectionSource = async <T extends CollectionSource>(
    sockCtx: SocketContextType,
    collectionId: UID,
    type: T
): Promise<CollectionSourceDataInstance<T> | undefined> => {
    return await sockCtx.emit(ClientSE.READ_COLLECTION_SOURCE, {
        id: collectionId,
        source: type,
    });
};

export const addToCollectionSource = async (
    sockCtx: SocketContextType,
    collectionId: UID,
    itemIds: UID[],
    type: EditableCollectionSource
): Promise<void> => {
    await sockCtx.emit(ClientSE.ADD_TO_COLLECTION_SOURCE, {
        collectionId,
        itemIds,
        source: type,
    });
};

export const removeFromCollectionSource = async (
    sockCtx: SocketContextType,
    collectionId: UID,
    itemIds: UID[],
    type: EditableCollectionSource
): Promise<void> => {
    await sockCtx.emit(ClientSE.REMOVE_FROM_COLLECTION_SOURCE, {
        collectionId,
        itemIds,
        source: type,
    });
};
