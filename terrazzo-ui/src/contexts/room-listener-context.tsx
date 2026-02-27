import { ClientSE, ClientSEReplies, RoomId, UID } from '@mosaiq/terrazzo-common';
import React, { createContext, useCallback, useContext } from 'react';
import { useStatelessMap } from '../hooks/util/useStatelessMap';
import { useSocket } from './socket-context';

type InstanceId = UID;
type RoomListenerContextType = {
    subscribe: (roomId: RoomId, instanceId: InstanceId) => Promise<ClientSEReplies[ClientSE.JOIN_ROOM] | undefined>;
    unsubscribe: (roomId: RoomId, instanceId: InstanceId) => Promise<ClientSEReplies[ClientSE.LEAVE_ROOM]>;
};
const RoomListenerContext = createContext<RoomListenerContextType | undefined>(undefined);

const RoomListenerProvider: React.FC<any> = ({ children }) => {
    const [roomListeners] = useStatelessMap<RoomId, Set<InstanceId>>();
    const sockCtx = useSocket();

    const subscribe = useCallback(
        async (roomId: RoomId, instanceId: InstanceId) => {
            if (roomListeners.get(roomId)) {
                roomListeners.get(roomId)?.add(instanceId);
            } else {
                roomListeners.set(roomId, new Set([instanceId]));
            }
            return await sockCtx.emit(ClientSE.JOIN_ROOM, roomId);
        },
        [roomListeners, sockCtx]
    );

    const unsubscribe = useCallback(
        async (roomId: RoomId, instanceId: InstanceId) => {
            roomListeners.get(roomId)?.delete(instanceId);
            if (roomListeners.get(roomId)?.size === 0) return await sockCtx.emit(ClientSE.LEAVE_ROOM, roomId);
        },
        [roomListeners, sockCtx]
    );

    return (
        <RoomListenerContext.Provider
            value={{
                subscribe,
                unsubscribe,
            }}
        >
            {children}
        </RoomListenerContext.Provider>
    );
};

const useRoomListener = () => {
    const context = useContext(RoomListenerContext);
    if (context === undefined) {
        throw new Error('useRoomListener must be used within a RoomListenerProvider');
    }
    return context;
};

export { RoomListenerProvider, useRoomListener };
