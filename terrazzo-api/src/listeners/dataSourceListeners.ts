import { ClientSE } from '@mosaiq/terrazzo-common';
import {
    addToCollectionSource,
    createObjectSource,
    readCollectionSource,
    readObjectSource,
    removeFromCollectionSource,
    updateObjectSource,
} from '@trz-api/controllers/dataSources/dataSourceController';
import { subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerDataSourceListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.READ_OBJECT_SOURCE, async (data) => {
        return await readObjectSource(data.id, data.source);
    });

    subscribe(socket, ClientSE.CREATE_OBJECT_SOURCE, async (data) => {
        await createObjectSource(data.data);
        return undefined;
    });

    subscribe(socket, ClientSE.UPDATE_OBJECT_SOURCE, async (data) => {
        await updateObjectSource(data.id, data.data);
        return undefined;
    });

    subscribe(socket, ClientSE.READ_COLLECTION_SOURCE, async (data) => {
        return await readCollectionSource(data.id, data.source);
    });

    subscribe(socket, ClientSE.ADD_TO_COLLECTION_SOURCE, async (data) => {
        await addToCollectionSource(data.collectionId, data.itemIds, data.source);
        return undefined;
    });

    subscribe(socket, ClientSE.REMOVE_FROM_COLLECTION_SOURCE, async (data) => {
        await removeFromCollectionSource(data.collectionId, data.itemIds, data.source);
        return undefined;
    });
};
