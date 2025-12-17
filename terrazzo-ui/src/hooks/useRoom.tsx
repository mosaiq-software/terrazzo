import { ClientSE, getRoomCode, RoomSpecifier, RoomType, ServerSE, SocketId, UID, UserData } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect } from 'react';
import { useMap } from './useMap';

const DUMMY = [new Map<string, UserData>(), (map: [string, UserData][] | Map<string, UserData>) => {}] as const;

export function useRoom(roomType: RoomType, roomId: UID | string | null | undefined, specifier?: RoomSpecifier, trackUsers: boolean = false): readonly [Map<string, UserData>, (map: [string, UserData][] | Map<string, UserData>) => void] {
    const [roomUsers, setRoomUsers] = useMap<SocketId, UserData>([]);
    const sockCtx = useSocket();

    useEffect(() => {
        if (!sockCtx.connected) {
            return;
        }
        if (roomId) {
            sockCtx
                .emit(ClientSE.JOIN_ROOM, getRoomCode(roomType, roomId, specifier))
                .then((res) => {
                    if (res && trackUsers) {
                        setRoomUsers(res.map((r) => [r.sid, r]));
                    }
                })
                .catch((e) => {
                    notify(NoteType.SOCKET_ROOM_ERROR, [roomId, e]);
                });
        }

        return () => {
            if (roomId) {
                sockCtx.emit(ClientSE.LEAVE_ROOM, getRoomCode(roomType, roomId, specifier)).catch((e) => {
                    notify(NoteType.SOCKET_ROOM_ERROR, [roomId, e]);
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
