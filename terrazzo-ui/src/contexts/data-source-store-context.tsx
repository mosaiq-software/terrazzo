import { getRoomCode, ObjectSource, ObjectSourceDataInstance, RoomType, ServerSE, UID } from '@mosaiq/terrazzo-common';
import { readObjectSource } from '@trz/emitters';
import { useSocketListener } from '@trz/hooks/util/useSocketListener';
import { useStatelessMap } from '@trz/hooks/util/useStatelessMap';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRoomListener } from './room-listener-context';
import { useSocket } from './socket-context';

type InstanceId = UID;

interface Subscriber<T extends ObjectSource = ObjectSource> {
    instanceId: InstanceId;
    objectId: UID;
    source: T;
    callback: (data: ObjectSourceDataInstance<T> | undefined) => void;
}

type ObjectSourceKey = `${ObjectSource}:${UID}`;

export type DataSourcesContextType = {
    subscribeObject: (sub: Subscriber) => Promise<void>;
    unsubscribeObject: (instanceId: InstanceId) => void;
};

const DataSourcesContext = createContext<DataSourcesContextType | undefined>(undefined);

const DataSourcesProvider: React.FC<any> = ({ children }) => {
    const sockCtx = useSocket();
    const roomCtx = useRoomListener();
    const [objectSources] = useStatelessMap<ObjectSourceKey, ObjectSourceDataInstance<ObjectSource> | undefined>();
    const [objectSubscribers] = useStatelessMap<ObjectSourceKey, Set<InstanceId>>();
    const [instanceSubscribers] = useStatelessMap<InstanceId, Subscriber>();

    useSocketListener(ServerSE.OBJECT_SOURCE_UPDATE, (payload) => {
        const key: ObjectSourceKey = `${payload.type}:${payload.data.id}`;
        objectSources.set(key, payload.data);
        const subscribers = objectSubscribers.get(key);
        if (!subscribers) {
            return;
        }
        for (const instanceId of subscribers) {
            const sub = instanceSubscribers.get(instanceId);
            if (sub) {
                sub.callback(payload.data);
            }
        }
    });

    const subscribeObject = useCallback(
        async (sub: Subscriber) => {
            // Verify that everything needed to subscribe is present
            if (!sockCtx.connected) {
                console.warn('Socket not connected, cannot subscribe to object source');
                return;
            }
            if (instanceSubscribers.has(sub.instanceId)) {
                console.error(`Subscriber with instanceId ${sub.instanceId} already exists.`);
                throw new Error(`Subscriber with instanceId ${sub.instanceId} already exists.`);
            }

            // Add subscriber to the map with a callback that filters for updates to this specific object source
            instanceSubscribers.set(sub.instanceId, sub);

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
        [instanceSubscribers, objectSources, sockCtx]
    );

    const unsubscribeObject = useCallback(
        (instanceId: InstanceId) => {
            // Remove subscriber from the map
            const sub = instanceSubscribers.get(instanceId);
            if (!sub) {
                return;
            }
            sub.callback(undefined);
            instanceSubscribers.delete(instanceId);

            // Unsubscribe from the room to stop receiving updates on this client
            const roomId = getRoomCode(RoomType.SOURCE, sub.objectId, sub.source);
            roomCtx.unsubscribe(roomId, instanceId);

            // If this was the last subscriber for this object source, we can clean up the old data
        },
        [instanceSubscribers]
    );

    return (
        <DataSourcesContext.Provider
            value={{
                subscribeObject,
                unsubscribeObject,
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

export { DataSourcesProvider, useDataSources, useObjectSource };
