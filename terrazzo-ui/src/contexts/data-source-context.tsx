import {
    CollectionSource,
    CollectionSourceDataInstance,
    getRoomCode,
    ObjectSource,
    ObjectSourceDataInstance,
    RoomType,
    ServerSE,
    UID,
} from '@mosaiq/terrazzo-common';
import { readCollectionSource, readObjectSource } from '@trz/emitters';
import { useSocketListener } from '@trz/hooks/util/useSocketListener';
import { useStatelessMap } from '@trz/hooks/util/useStatelessMap';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRoomListener } from './room-listener-context';
import { useSocket } from './socket-context';

type InstanceId = UID;

interface ObjectSubscriber<T extends ObjectSource = ObjectSource> {
    instanceId: InstanceId;
    objectId: UID;
    source: T;
    callback: (data: ObjectSourceDataInstance<T> | undefined) => void;
}
interface CollectionSubscriber<T extends CollectionSource = CollectionSource> {
    instanceId: InstanceId;
    objectId: UID;
    source: T;
    callback: (data: CollectionSourceDataInstance<T> | undefined) => void;
}

type ObjectSourceKey = `${ObjectSource}:${UID}`;
type CollectionSourceKey = `${CollectionSource}:${UID}`;

export type DataSourcesContextType = {
    subscribeObject: (sub: ObjectSubscriber) => Promise<void>;
    unsubscribeObject: (instanceId: InstanceId) => void;
    subscribeCollection: (sub: CollectionSubscriber) => Promise<void>;
    unsubscribeCollection: (instanceId: InstanceId) => void;
};

const DataSourcesContext = createContext<DataSourcesContextType | undefined>(undefined);

const DataSourcesProvider: React.FC<any> = ({ children }) => {
    const sockCtx = useSocket();
    const roomCtx = useRoomListener();

    // Object sources
    const [objectSources] = useStatelessMap<ObjectSourceKey, ObjectSourceDataInstance<ObjectSource> | undefined>();
    const [objectInstanceSubscribers] = useStatelessMap<InstanceId, ObjectSubscriber>();
    const [objectSubscribers] = useStatelessMap<ObjectSourceKey, Set<InstanceId>>();

    useSocketListener(ServerSE.OBJECT_SOURCE_UPDATE, (payload) => {
        const key: ObjectSourceKey = `${payload.type}:${payload.data.id}`;
        objectSources.set(key, payload.data);
        const subscribers = objectSubscribers.get(key);
        if (!subscribers) {
            return;
        }
        for (const instanceId of subscribers) {
            const sub = objectInstanceSubscribers.get(instanceId);
            if (sub) {
                sub.callback(payload.data);
            }
        }
    });

    const subscribeObject = useCallback(
        async (sub: ObjectSubscriber) => {
            // Verify that everything needed to subscribe is present
            if (!sockCtx.connected) {
                console.warn('Socket not connected, cannot subscribe to object source');
                return;
            }
            if (objectInstanceSubscribers.has(sub.instanceId)) {
                console.error(`Subscriber with instanceId ${sub.instanceId} already exists.`);
                throw new Error(`Subscriber with instanceId ${sub.instanceId} already exists.`);
            }

            // Add subscriber to the map with a callback that filters for updates to this specific object source
            objectInstanceSubscribers.set(sub.instanceId, sub);

            // Send over the initial data if we have it, otherwise fetch it and then send it
            const key: ObjectSourceKey = `${sub.source}:${sub.objectId}`;
            if (!objectSources.has(key)) {
                try {
                    const data = await readObjectSource(sockCtx, sub.objectId, sub.source);
                    objectSources.set(key, data);
                } catch (e) {
                    console.error(`Failed to initialize object source ${sub.source} with id ${sub.objectId}:`, e);
                }
            }
            const existingData = objectSources.get(key);
            sub.callback(existingData);

            // Subscribe to the room to receive updates on this client
            const roomId = getRoomCode(RoomType.SOURCE, sub.objectId, sub.source);
            roomCtx.subscribe(roomId, sub.instanceId);
        },
        [objectInstanceSubscribers, objectSources, sockCtx]
    );

    const unsubscribeObject = useCallback(
        (instanceId: InstanceId) => {
            // Remove subscriber from the map
            const sub = objectInstanceSubscribers.get(instanceId);
            if (!sub) {
                return;
            }
            sub.callback(undefined);
            objectInstanceSubscribers.delete(instanceId);

            // Unsubscribe from the room to stop receiving updates on this client
            const roomId = getRoomCode(RoomType.SOURCE, sub.objectId, sub.source);
            roomCtx.unsubscribe(roomId, instanceId);

            // If this was the last subscriber for this object source, we can clean up the old data
        },
        [objectInstanceSubscribers]
    );

    // Collection sources
    const [collectionSources] = useStatelessMap<
        CollectionSourceKey,
        CollectionSourceDataInstance<CollectionSource> | undefined
    >();
    const [collectionSubscribers] = useStatelessMap<CollectionSourceKey, Set<InstanceId>>();
    const [collectionInstanceSubscribers] = useStatelessMap<InstanceId, CollectionSubscriber>();

    useSocketListener(ServerSE.COLLECTION_SOURCE_UPDATE, (payload) => {
        const key: CollectionSourceKey = `${payload.type}:${payload.id}`;
        collectionSources.set(key, payload.data);
        const subscribers = collectionSubscribers.get(key);
        if (!subscribers) {
            return;
        }
        for (const instanceId of subscribers) {
            const sub = collectionInstanceSubscribers.get(instanceId);
            if (sub) {
                sub.callback(payload.data);
            }
        }
    });

    const subscribeCollection = useCallback(
        async (sub: CollectionSubscriber) => {
            // Verify that everything needed to subscribe is present
            if (!sockCtx.connected) {
                console.warn('Socket not connected, cannot subscribe to collection source');
                return;
            }
            if (collectionInstanceSubscribers.has(sub.instanceId)) {
                console.error(`Subscriber with instanceId ${sub.instanceId} already exists.`);
                throw new Error(`Subscriber with instanceId ${sub.instanceId} already exists.`);
            }

            // Add subscriber to the map with a callback that filters for updates to this specific collection source
            collectionInstanceSubscribers.set(sub.instanceId, sub);

            // Send over the initial data if we have it, otherwise fetch it and then send it
            const key: CollectionSourceKey = `${sub.source}:${sub.objectId}`;
            if (!collectionSources.has(key)) {
                try {
                    const data = await readCollectionSource(sockCtx, sub.objectId, sub.source);
                    collectionSources.set(key, data);
                } catch (e) {
                    console.error(`Failed to initialize collection source ${sub.source} with id ${sub.objectId}:`, e);
                }
            }
            const existingData = collectionSources.get(key);
            sub.callback(existingData);

            // Subscribe to the room to receive updates on this client
            const roomId = getRoomCode(RoomType.SOURCE, sub.objectId, sub.source);
            roomCtx.subscribe(roomId, sub.instanceId);
        },
        [collectionInstanceSubscribers, collectionSources, sockCtx]
    );

    const unsubscribeCollection = useCallback(
        (instanceId: InstanceId) => {
            // Remove subscriber from the map
            const sub = collectionInstanceSubscribers.get(instanceId);
            if (!sub) {
                return;
            }
            sub.callback(undefined);
            collectionInstanceSubscribers.delete(instanceId);

            // Unsubscribe from the room to stop receiving updates on this client
            const roomId = getRoomCode(RoomType.SOURCE, sub.objectId, sub.source);
            roomCtx.unsubscribe(roomId, instanceId);

            // If this was the last subscriber for this collection source, we can clean up the old data
        },
        [collectionInstanceSubscribers]
    );

    return (
        <DataSourcesContext.Provider
            value={{
                subscribeObject,
                unsubscribeObject,
                subscribeCollection,
                unsubscribeCollection,
            }}
        >
            {children}
        </DataSourcesContext.Provider>
    );
};

const useDataSources = () => {
    const context = useContext(DataSourcesContext);
    if (context === undefined) {
        throw new Error('useDataSources must be used within a DataSourcesProvider');
    }
    return context;
};

const useObjectSource = <T extends ObjectSource>(objectId: UID, source: T): ObjectSourceDataInstance<T> | undefined => {
    const { subscribeObject, unsubscribeObject } = useDataSources();
    const [instanceId] = useState<InstanceId>(crypto.randomUUID());
    const [sourceData, setSourceData] = useState<ObjectSourceDataInstance<T> | undefined>(undefined);

    const callback = useCallback((data: ObjectSourceDataInstance<T> | undefined) => {
        setSourceData(data);
    }, []);

    useEffect(() => {
        subscribeObject({ instanceId, objectId, source, callback });
        return () => {
            unsubscribeObject(instanceId);
        };
    }, [instanceId, subscribeObject, unsubscribeObject]);

    return sourceData;
};

const useCollectionSource = <T extends CollectionSource>(
    objectId: UID,
    source: T
): CollectionSourceDataInstance<T> | undefined => {
    const { subscribeCollection, unsubscribeCollection } = useDataSources();
    const [instanceId] = useState<InstanceId>(crypto.randomUUID());
    const [sourceData, setSourceData] = useState<CollectionSourceDataInstance<T> | undefined>(undefined);

    const callback = useCallback((data: CollectionSourceDataInstance<T> | undefined) => {
        setSourceData(data);
    }, []);

    useEffect(() => {
        subscribeCollection({ instanceId, objectId, source, callback });
        return () => {
            unsubscribeCollection(instanceId);
        };
    }, [instanceId, subscribeCollection, unsubscribeCollection]);

    return sourceData;
};

export { DataSourcesProvider, useCollectionSource, useObjectSource };
