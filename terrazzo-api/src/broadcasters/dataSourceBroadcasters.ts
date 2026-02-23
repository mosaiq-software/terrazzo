import { CollectionSource, getRoomCode, ObjectSource, RoomType, ServerSE, UID } from '@mosaiq/terrazzo-common';
import { readObjectSource } from '@trz-api/controllers/dataSources/dataSourceController';
import { broadcast } from '@trz-api/utils/socket/socketActions';

export const syncObjectSource = async <T extends ObjectSource>(sourceId: UID, type: T) => {
    try {
        const source = await readObjectSource(sourceId, type);
        if (!source) {
            throw new Error(`Object source of type ${type} with id ${sourceId} not found`);
        }

        broadcast({
            event: ServerSE.OBJECT_SOURCE_UPDATE,
            toRoomIds: [getRoomCode(RoomType.SOURCE, sourceId), getRoomCode(RoomType.SOURCE, sourceId, type)],
            buildPayload: async (userId) => {
                if (!userId) {
                    throw new Error('No userId provided for syncing object data source');
                }
                return source;
            },
        });
    } catch (error) {
        console.error('Error syncing object data source', error);
    }
};

export const syncCollectionSource = async <T extends CollectionSource>(sourceId: UID, type: T) => {
    // TODO this
    throw new Error('syncCollectionSource not implemented yet');
    // try {
    //     const source = await readCollectionSource(sourceId, type);
    //     if (!source) {
    //         throw new Error(`Collection source of type ${type} with id ${sourceId} not found`);
    //     }

    //     const payload: CollectionSourceUpdatePayload<T> = { id: sourceId, type, data: source };

    //     broadcast({
    //         event: ServerSE.COLLECTION_SOURCE_UPDATE,
    //         toRoomIds: [getRoomCode(RoomType.SOURCE, sourceId), getRoomCode(RoomType.SOURCE, sourceId, type)],
    //         buildPayload: async (userId) => {
    //             if (!userId) {
    //                 throw new Error('No userId provided for syncing collection data source');
    //             }
    //             return payload;
    //         },
    //     });
    // } catch (error) {
    //     console.error('Error syncing collection data source', error);
    // }
};
