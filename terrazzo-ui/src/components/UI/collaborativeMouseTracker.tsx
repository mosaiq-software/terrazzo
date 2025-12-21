import { Box, MantineStyleProp } from '@mantine/core';
import { useIdle, useThrottledCallback } from '@mantine/hooks';
import { BoardId, CardId, ClientSE, ListId, Position, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import UserCursor from '@trz/components/Boards/UserCursor';
import { useSocket } from '@trz/contexts/socket-context';
import { useRoom } from '@trz/hooks/useRoom';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { IDLE_TIMEOUT_MS, MOUSE_UPDATE_THROTTLE_MS } from '@trz/util/realtimeUtils';
import { MouseEventHandler, useCallback, useEffect, useRef } from 'react';

interface CollaborativeMouseTrackerProps {
    boardId: BoardId;
    style?: MantineStyleProp;
    children?: any;
    draggingObject: {
        list?: ListId;
        card?: CardId;
    };
    disableTracking?: boolean;
}
const CollaborativeMouseTracker = (props: CollaborativeMouseTrackerProps) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const sockCtx = useSocket();
    const [roomUsers, setRoomUsersState] = useRoom(RoomType.MOUSE, props.disableTracking ? undefined : props.boardId, RoomSpecifier.DEFAULT, true);

    useSocketListener(ServerSE.MOUSE_MOVE, (payload) => {
        const user = roomUsers.get(payload.sid);
        if (!user) {
            return;
        }
        roomUsers.set(payload.sid, {
            ...user,
            mouseRoomData: payload.data,
        });
    });

    useSocketListener(ServerSE.USER_IDLE, (payload) => {
        const user = roomUsers.get(payload.sid);
        if (!user) {
            return;
        }
        roomUsers.set(payload.sid, {
            ...user,
            idle: payload.idle,
        });
    });

    const idle = useIdle(IDLE_TIMEOUT_MS);
    useEffect(() => setIdle(idle), [idle]);

    const moveMouse = useThrottledCallback((pos: Position) => {
        if (props.disableTracking) {
            return;
        }
        sockCtx.volatileEmit(ClientSE.MOUSE_MOVE, {
            pos,
            draggingList: props.draggingObject.list,
            draggingCard: props.draggingObject.card,
            contextId: props.boardId,
        });
    }, MOUSE_UPDATE_THROTTLE_MS);

    const setIdle = useCallback(
        (idle: boolean) => {
            if (props.disableTracking) {
                return;
            }
            sockCtx.emit(ClientSE.USER_IDLE, idle);
        },
        [sockCtx]
    );

    const handleMoveMouse: MouseEventHandler<HTMLDivElement> = useCallback(
        (event) => {
            if (!ref.current || Array.from(roomUsers.keys()).length === 0 || props.disableTracking) {
                return;
            }
            const rect = event.currentTarget.getBoundingClientRect();
            const x = Math.max(0, Math.round(event.pageX - rect.left - (window.pageXOffset || window.scrollX)));
            const y = Math.max(0, Math.round(event.pageY - rect.top - (window.pageYOffset || window.scrollY)));
            moveMouse({ x: x, y: y });
        },
        [sockCtx, ref.current]
    );

    return (
        <Box
            style={props.style}
            ref={ref}
            onMouseMove={handleMoveMouse}
        >
            {props.children}
            {Array.from(roomUsers.entries()).map(([sid, user]) => {
                if (sid === sockCtx.sid || !user.mouseRoomData) {
                    return null;
                }
                return (
                    <UserCursor
                        key={sid}
                        position={{
                            x: user.mouseRoomData.pos.x + (ref.current?.getBoundingClientRect().left ?? 0),
                            y: user.mouseRoomData.pos.y + (ref.current?.getBoundingClientRect().top ?? 0),
                        }}
                        userId={user.userId}
                        idle={user.idle}
                    />
                );
            })}
        </Box>
    );
};

export default CollaborativeMouseTracker;
