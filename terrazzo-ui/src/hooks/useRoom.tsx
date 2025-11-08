import { useEffect } from 'react';
import { ClientSE, RoomType, ServerSE, SocketId, UserData } from '@mosaiq/terrazzo-common/socketTypes';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { useSocket } from '@trz/contexts/socket-context';
import { NoteType, notify } from '@trz/util/notifications';
import { UID } from '@mosaiq/terrazzo-common/types';
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { useMap } from './useMap';

export function useRoom(roomType: RoomType, roomId: UID | null | undefined, trackUsers: boolean): [Map<string, UserData>, (map: [string, UserData][] | Map<string, UserData>) => void] {
    const [roomUsers, setRoomUsers] = useMap<SocketId, UserData>([]);
    const sockCtx = useSocket();

    useEffect(() => {
        if (!sockCtx.connected) {
            return;
        }
        if (roomId) {
            sockCtx
                .emit(ClientSE.JOIN_ROOM, getRoomCode(roomType, roomId))
                .then((res) => {
                    if (res) {
                        setRoomUsers(res.map((r) => [r.sid, r]));
                    }
                })
                .catch((e) => {
                    notify(NoteType.SOCKET_ROOM_ERROR, [roomId, e]);
                });
        }

        return () => {
            if (roomId) {
                sockCtx.emit(ClientSE.LEAVE_ROOM, getRoomCode(roomType, roomId)).catch((e) => {
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
        return [new Map(), () => {}];
    }
}
