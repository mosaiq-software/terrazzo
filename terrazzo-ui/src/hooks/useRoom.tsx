import {
    getRoomCode,
    RoomSpecifier,
    RoomType,
    ServerSE,
    SocketId,
    UID,
    UserData
} from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { useEffect, useMemo, useState } from 'react';
import { useRoomListener } from '../contexts/room-listener-context';
import { useMap } from './useMap';

export function useRoom(
    roomType: RoomType,
    roomId: UID | string | null | undefined,
    specifier?: RoomSpecifier,
    trackUsers: boolean = false
): readonly [Map<string, UserData>, (map: [string, UserData][] | Map<string, UserData>) => void] {
    const [roomUsers, setRoomUsers] = useMap<SocketId, UserData>([]);
    const sockCtx = useSocket();

    const DUMMY = useMemo(
        () => [new Map<string, UserData>(), (map: [string, UserData][] | Map<string, UserData>) => {}] as const,
        []
    );

    const [instanceId] = useState(crypto.randomUUID());
    const roomListener = useRoomListener();
    useEffect(() => {
        if (!sockCtx.connected) {
            return;
        }
        if (roomId) {
            roomListener.subscribe(getRoomCode(roomType, roomId, specifier), instanceId).then(res => {
                if (res && trackUsers) {
                    setRoomUsers(res.map((r) => [r.sid, r]));
                }
            });
        }

        return () => {
            if (roomId) {
                roomListener.unsubscribe(getRoomCode(roomType, roomId, specifier), instanceId).then(res => {
                    if (trackUsers) { 
                        setRoomUsers([]);
                    }
                });
            }
        };
    }, [roomId, sockCtx.connected, sockCtx.sid]);
    

    useSocketListener(ServerSE.CLIENT_JOINED_ROOM, (payload) => {
        if (trackUsers) {
            roomUsers.set(payload.sid, payload);
        }
    });

    useSocketListener(ServerSE.CLIENT_LEFT_ROOM, (payload) => {
        if (trackUsers) {
            roomUsers.delete(payload);
        }
    });

    if (trackUsers) {
        return [roomUsers, setRoomUsers];
    } else {
        return DUMMY;
    }
}
