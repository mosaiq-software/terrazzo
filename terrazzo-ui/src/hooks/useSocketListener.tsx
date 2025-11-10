import { ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common/socketTypes';
import { useSocket } from '@trz/contexts/socket-context';
import { useEffect } from 'react';

export function useSocketListener<T extends ServerSE>(event: T, callback: (payload: ServerSEPayload[T]) => void, extraDeps: any[] = []): void {
    const sockCtx = useSocket();
    useEffect(() => {
        if (sockCtx.socket) {
            sockCtx.socket.on(event, callback as any);
        }
        return () => {
            sockCtx.socket?.off(event, callback as any);
        };
    }, [sockCtx.socket, ...extraDeps]);
}
