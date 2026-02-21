import {
    ClientSE,
    CollectionSource,
    CollectionSourceDataInstance,
    getRoomCode,
    ObjectSource,
    ObjectSourceDataInstance,
    RoomId,
    RoomType,
    ServerSE,
    ServerSEPayload,
    UID,
} from '@mosaiq/terrazzo-common';
import { SocketContextType, useSocket } from '@trz/contexts/socket-context';
import { readCollectionSource, readObjectSource } from '@trz/emitters/dataSourceEmitters';
import React, { createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

type Listener = () => void;

type StoredState<T> = {
    data: T | undefined;
    loading: boolean;
    error: string | undefined;
};

export type DataSourceResult<T> = {
    data: T | undefined;
    loading: boolean;
    error: string | undefined;
    refetch: () => Promise<void>;
};

type BaseEntry<T> = {
    id: UID;
    refCount: number;
    joined: boolean;
    state: StoredState<T>;
    fetchPromise: Promise<void> | undefined;
    listeners: Set<Listener>;
};

type ObjectEntry<T extends ObjectSource> = BaseEntry<ObjectSourceDataInstance<T>>;

type CollectionEntry<T extends CollectionSource> = BaseEntry<CollectionSourceDataInstance<T>>;

type ObjectEntryMaps = {
    [T in ObjectSource]: Map<UID, ObjectEntry<T>>;
};

type CollectionEntryMaps = {
    [T in CollectionSource]: Map<UID, CollectionEntry<T>>;
};

function emptyState<T>(): StoredState<T> {
    return {
        data: undefined,
        loading: false,
        error: undefined,
    };
}

function sourceRoomId(type: ObjectSource | CollectionSource, id: UID): RoomId {
    // Use type as the room specifier to avoid collisions across different sources that share the same id.
    return getRoomCode(RoomType.SOURCE, id, type);
}

class DataSourceStore {
    private socketCtx: SocketContextType | undefined;

    private objectEntries: ObjectEntryMaps = {
        [ObjectSource.Label]: new Map<UID, ObjectEntry<ObjectSource.Label>>(),
        [ObjectSource.Invite]: new Map<UID, ObjectEntry<ObjectSource.Invite>>(),
    };

    private collectionEntries: CollectionEntryMaps = {
        [CollectionSource.Labels]: new Map<UID, CollectionEntry<CollectionSource.Labels>>(),
        [CollectionSource.LabelAssignments]: new Map<UID, CollectionEntry<CollectionSource.LabelAssignments>>(),
    };

    setSocketContext(socketCtx: SocketContextType) {
        this.socketCtx = socketCtx;
    }

    private emit(entry: { listeners: Set<Listener> }) {
        for (const listener of entry.listeners) listener();
    }

    private setEntryState<T>(entry: BaseEntry<T>, next: StoredState<T>) {
        const prev = entry.state;
        if (prev.data === next.data && prev.loading === next.loading && prev.error === next.error) {
            return;
        }
        entry.state = next;
        this.emit(entry);
    }

    private getObjectMap<T extends ObjectSource>(type: T): Map<UID, ObjectEntry<T>> {
        return this.objectEntries[type];
    }

    private getCollectionMap<T extends CollectionSource>(type: T): Map<UID, CollectionEntry<T>> {
        return this.collectionEntries[type];
    }

    subscribeObject<T extends ObjectSource>(type: T, id: UID, listener: Listener): () => void {
        const entry = this.getObjectMap(type).get(id);
        if (!entry) {
            return () => {};
        }
        entry.listeners.add(listener);
        return () => {
            entry.listeners.delete(listener);
        };
    }

    subscribeCollection<T extends CollectionSource>(type: T, id: UID, listener: Listener): () => void {
        const entry = this.getCollectionMap(type).get(id);
        if (!entry) {
            return () => {};
        }
        entry.listeners.add(listener);
        return () => {
            entry.listeners.delete(listener);
        };
    }

    getObjectSnapshot<T extends ObjectSource>(type: T, id: UID): StoredState<ObjectSourceDataInstance<T>> {
        const entry = this.getObjectMap(type).get(id);
        return entry ? entry.state : emptyState<ObjectSourceDataInstance<T>>();
    }

    getCollectionSnapshot<T extends CollectionSource>(type: T, id: UID): StoredState<CollectionSourceDataInstance<T>> {
        const entry = this.getCollectionMap(type).get(id);
        return entry ? entry.state : emptyState<CollectionSourceDataInstance<T>>();
    }

    acquireObject<T extends ObjectSource>(type: T, id: UID) {
        const map = this.getObjectMap(type);
        const existing = map.get(id);
        if (existing) {
            existing.refCount++;
            return;
        }

        const entry: ObjectEntry<T> = {
            id,
            refCount: 1,
            joined: false,
            state: {
                data: undefined,
                loading: true,
                error: undefined,
            },
            fetchPromise: undefined,
            listeners: new Set<Listener>(),
        };

        map.set(id, entry);
        this.emit(entry);

        void this.joinAndFetchObject(type, id);
    }

    acquireCollection<T extends CollectionSource>(type: T, id: UID) {
        const map = this.getCollectionMap(type);
        const existing = map.get(id);
        if (existing) {
            existing.refCount++;
            return;
        }

        const entry: CollectionEntry<T> = {
            id,
            refCount: 1,
            joined: false,
            state: {
                data: undefined,
                loading: true,
                error: undefined,
            },
            fetchPromise: undefined,
            listeners: new Set<Listener>(),
        };

        map.set(id, entry);
        this.emit(entry);

        void this.joinAndFetchCollection(type, id);
    }

    releaseObject<T extends ObjectSource>(type: T, id: UID) {
        const map = this.getObjectMap(type);
        const entry = map.get(id);
        if (!entry) return;

        entry.refCount--;
        if (entry.refCount > 0) return;

        if (this.socketCtx?.connected && entry.joined) {
            const roomId = sourceRoomId(type, id);
            void this.socketCtx.emit(ClientSE.LEAVE_ROOM, roomId);
        }

        map.delete(id);
    }

    releaseCollection<T extends CollectionSource>(type: T, id: UID) {
        const map = this.getCollectionMap(type);
        const entry = map.get(id);
        if (!entry) return;

        entry.refCount--;
        if (entry.refCount > 0) return;

        if (this.socketCtx?.connected && entry.joined) {
            const roomId = sourceRoomId(type, id);
            void this.socketCtx.emit(ClientSE.LEAVE_ROOM, roomId);
        }

        map.delete(id);
    }

    private async joinRoom(type: ObjectSource | CollectionSource, id: UID): Promise<void> {
        if (!this.socketCtx?.connected) return;
        const roomId = sourceRoomId(type, id);
        await this.socketCtx.emit(ClientSE.JOIN_ROOM, roomId);
    }

    private async joinAndFetchObject<T extends ObjectSource>(type: T, id: UID): Promise<void> {
        if (!this.socketCtx?.connected) return;
        const entry = this.getObjectMap(type).get(id);
        if (!entry) return;

        if (!entry.joined) {
            await this.joinRoom(type, id);
            entry.joined = true;
        }

        await this.refetchObject(type, id);
    }

    private async joinAndFetchCollection<T extends CollectionSource>(type: T, id: UID): Promise<void> {
        if (!this.socketCtx?.connected) return;
        const entry = this.getCollectionMap(type).get(id);
        if (!entry) return;

        if (!entry.joined) {
            await this.joinRoom(type, id);
            entry.joined = true;
        }

        await this.refetchCollection(type, id);
    }

    async refetchObject<T extends ObjectSource>(type: T, id: UID): Promise<void> {
        if (!this.socketCtx?.connected) return;
        const entry = this.getObjectMap(type).get(id);
        if (!entry) return;

        if (entry.fetchPromise) return entry.fetchPromise;

        entry.fetchPromise = (async () => {
            this.setEntryState(entry, { ...entry.state, loading: true, error: undefined });

            try {
                const data = await readObjectSource(this.socketCtx!, id, type);
                this.setEntryState(entry, { data, loading: false, error: undefined });
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Failed to load';
                this.setEntryState(entry, { ...entry.state, loading: false, error: message });
            } finally {
                const latest = this.getObjectMap(type).get(id);
                if (latest) {
                    latest.fetchPromise = undefined;
                }
            }
        })();

        return entry.fetchPromise;
    }

    async refetchCollection<T extends CollectionSource>(type: T, id: UID): Promise<void> {
        if (!this.socketCtx?.connected) return;
        const entry = this.getCollectionMap(type).get(id);
        if (!entry) return;

        if (entry.fetchPromise) return entry.fetchPromise;

        entry.fetchPromise = (async () => {
            this.setEntryState(entry, { ...entry.state, loading: true, error: undefined });

            try {
                const data = await readCollectionSource(this.socketCtx!, id, type);
                this.setEntryState(entry, { data, loading: false, error: undefined });
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Failed to load';
                this.setEntryState(entry, { ...entry.state, loading: false, error: message });
            } finally {
                const latest = this.getCollectionMap(type).get(id);
                if (latest) {
                    latest.fetchPromise = undefined;
                }
            }
        })();

        return entry.fetchPromise;
    }

    onObjectUpdate(payload: ServerSEPayload[ServerSE.OBJECT_SOURCE_UPDATE]) {
        switch (payload.type) {
            case ObjectSource.Label: {
                const entry = this.getObjectMap(ObjectSource.Label).get(payload.data.id);
                if (!entry) return;
                this.setEntryState(entry, { data: payload.data, loading: false, error: undefined });
                return;
            }
            case ObjectSource.Invite: {
                const entry = this.getObjectMap(ObjectSource.Invite).get(payload.data.id);
                if (!entry) return;
                this.setEntryState(entry, { data: payload.data, loading: false, error: undefined });
                return;
            }
        }
    }

    onCollectionUpdate(payload: ServerSEPayload[ServerSE.COLLECTION_SOURCE_UPDATE]) {
        switch (payload.type) {
            case CollectionSource.Labels: {
                const entry = this.getCollectionMap(CollectionSource.Labels).get(payload.id);
                if (!entry) return;
                this.setEntryState(entry, { data: payload.data, loading: false, error: undefined });
                return;
            }
            case CollectionSource.LabelAssignments: {
                const entry = this.getCollectionMap(CollectionSource.LabelAssignments).get(payload.id);
                if (!entry) return;
                this.setEntryState(entry, { data: payload.data, loading: false, error: undefined });
                return;
            }
        }
    }

    async onConnected(): Promise<void> {
        if (!this.socketCtx?.connected) return;

        const allObjectSources: ObjectSource[] = [ObjectSource.Label, ObjectSource.Invite];
        const allCollectionSources: CollectionSource[] = [CollectionSource.Labels, CollectionSource.LabelAssignments];

        const promises: Promise<void>[] = [];

        for (const type of allObjectSources) {
            const map = this.getObjectMap(type);
            for (const [id, entry] of map.entries()) {
                if (entry.refCount <= 0) continue;
                promises.push(
                    (async () => {
                        if (!entry.joined) {
                            await this.joinRoom(type, id);
                            entry.joined = true;
                        }
                        await this.refetchObject(type, id);
                    })()
                );
            }
        }

        for (const type of allCollectionSources) {
            const map = this.getCollectionMap(type);
            for (const [id, entry] of map.entries()) {
                if (entry.refCount <= 0) continue;
                promises.push(
                    (async () => {
                        if (!entry.joined) {
                            await this.joinRoom(type, id);
                            entry.joined = true;
                        }
                        await this.refetchCollection(type, id);
                    })()
                );
            }
        }

        await Promise.all(promises);
    }
}

const DataSourceStoreContext = createContext<DataSourceStore | undefined>(undefined);

export const DataSourceStoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const sockCtx = useSocket();

    const storeRef = useRef<DataSourceStore | null>(null);
    if (storeRef.current === null) {
        storeRef.current = new DataSourceStore();
    }
    const store = storeRef.current;

    useEffect(() => {
        store.setSocketContext(sockCtx);
    }, [sockCtx]);

    useEffect(() => {
        const socket = sockCtx.socket;
        if (!socket) return;

        const onObject = (payload: ServerSEPayload[ServerSE.OBJECT_SOURCE_UPDATE]) => {
            store.onObjectUpdate(payload);
        };
        const onCollection = (payload: ServerSEPayload[ServerSE.COLLECTION_SOURCE_UPDATE]) => {
            store.onCollectionUpdate(payload);
        };

        socket.on(ServerSE.OBJECT_SOURCE_UPDATE, onObject);
        socket.on(ServerSE.COLLECTION_SOURCE_UPDATE, onCollection);

        return () => {
            socket.off(ServerSE.OBJECT_SOURCE_UPDATE, onObject);
            socket.off(ServerSE.COLLECTION_SOURCE_UPDATE, onCollection);
        };
    }, [sockCtx.socket]);

    useEffect(() => {
        if (!sockCtx.connected) return;
        void store.onConnected();
    }, [sockCtx.connected, sockCtx.sid]);

    return <DataSourceStoreContext.Provider value={store}>{children}</DataSourceStoreContext.Provider>;
};

function useDataSourceStore(): DataSourceStore {
    const store = useContext(DataSourceStoreContext);
    if (!store) {
        throw new Error('useDataSourceStore must be used within a DataSourceStoreProvider');
    }
    return store;
}

export function useObjectDataSource<T extends ObjectSource>(
    type: T,
    id: UID | null | undefined
): DataSourceResult<ObjectSourceDataInstance<T>> {
    const store = useDataSourceStore();

    useEffect(() => {
        if (!id) return;
        store.acquireObject(type, id);
        return () => store.releaseObject(type, id);
    }, [store, type, id]);

    const snapshot = useSyncExternalStore(
        (onStoreChange) => {
            if (!id) return () => {};
            return store.subscribeObject(type, id, onStoreChange);
        },
        () => {
            if (!id) return emptyState<ObjectSourceDataInstance<T>>();
            const snap = store.getObjectSnapshot(type, id);
            if (snap.data === undefined && snap.loading === false && snap.error === undefined) {
                return { data: undefined, loading: true, error: undefined };
            }
            return snap;
        }
    );

    return {
        ...snapshot,
        refetch: async () => {
            if (!id) return;
            await store.refetchObject(type, id);
        },
    };
}

export function useCollectionDataSource<T extends CollectionSource>(
    type: T,
    id: UID | null | undefined
): DataSourceResult<CollectionSourceDataInstance<T>> {
    const store = useDataSourceStore();

    useEffect(() => {
        if (!id) return;
        store.acquireCollection(type, id);
        return () => store.releaseCollection(type, id);
    }, [store, type, id]);

    const snapshot = useSyncExternalStore(
        (onStoreChange) => {
            if (!id) return () => {};
            return store.subscribeCollection(type, id, onStoreChange);
        },
        () => {
            if (!id) return emptyState<CollectionSourceDataInstance<T>>();
            const snap = store.getCollectionSnapshot(type, id);
            if (snap.data === undefined && snap.loading === false && snap.error === undefined) {
                return { data: undefined, loading: true, error: undefined };
            }
            return snap;
        }
    );

    return {
        ...snapshot,
        refetch: async () => {
            if (!id) return;
            await store.refetchCollection(type, id);
        },
    };
}
