import {
    ClientSE,
    ClientSEPayload,
    ClientSEReplies,
    ClientSocketIOEvent,
    ServerSE,
    ServerSEPayload,
    SocketHandshakeAuth,
    SocketId,
} from '@mosaiq/terrazzo-common';
import { NoteType, notify } from '@trz/util/notifications';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserContext } from './user-context';

/** Special status string from socket.io client when disconnecting */
const IO_CLIENT_DISCONNECT = 'io client disconnect';

export type SocketContextType = {
    socket: Socket | null;
    sid: SocketId | undefined;
    connected: boolean;
    emit<T extends ClientSE>(event: T, payload: ClientSEPayload[T]): Promise<ClientSEReplies[T] | undefined>;
    volatileEmit: <T extends ClientSE>(
        event: ClientSE,
        payload: ClientSEPayload[T]
    ) => Promise<ClientSEReplies[T] | undefined>;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SocketProvider: React.FC<any> = ({ children }) => {
    const userCtx = useUserContext();
    const [socket, setSocketState] = useState<Socket | null>(null);
    const [connected, setConnected] = useState<boolean>(false);

    useEffect(() => {
        const socketUrl = import.meta.env.SOCKET_URL;
        if (!socketUrl) {
            throw new Error('SOCKET_URL environment variable is not set');
        }

        // CREATE SOCKET CONNECTION
        const auth: SocketHandshakeAuth = {
            userId: userCtx.userId,
            authToken: userCtx.authToken,
        };
        const sock = io(socketUrl, {
            auth,
            path: '/socket',
        });

        setSocketState(sock);

        // ENGINE EVENTS - provided by socket.io
        sock.on(ClientSocketIOEvent.CONNECT, async () => {
            const engine = sock.io.engine;
            setConnected(false);
            engine.once('upgrade', () => {
                if (engine.transport.name !== 'websocket') {
                    notify(NoteType.CONNECTION_ERROR);
                    sock.disconnect();
                }
            });
        });

        sock.on(ClientSocketIOEvent.CONNECT_ERROR, () => {
            setConnected(false);
            notify(NoteType.CONNECTION_ERROR);
        });

        sock.on(ClientSocketIOEvent.DISCONNECT, (reason) => {
            if (reason === IO_CLIENT_DISCONNECT) {
                // Disconnection was initiated by the client, do not attempt to reconnect
                return;
            }
            setConnected(false);
            notify(NoteType.DISCONNECTED);
        });
        sock.io.on(ClientSocketIOEvent.RECONNECT_ATTEMPT, () => {
            notify(NoteType.RECONNECTING);
        });

        sock.io.on(ClientSocketIOEvent.RECONNECT, () => {
            const engine = sock.io.engine;
            setConnected(false);
            notify(NoteType.RECONNECTING_SERVER_FOUND);
            engine.once('upgrade', () => {
                if (engine.transport.name === 'websocket') {
                    notify(NoteType.CONNECTION_ESTABLISHED);
                } else {
                    notify(NoteType.CONNECTION_ERROR);
                    sock.disconnect();
                }
            });
        });

        sock.on(ServerSE.READY, async (payload: ServerSEPayload[ServerSE.READY]) => {
            setConnected(true);
        });

        return () => {
            setConnected(false);
            sock.disconnect();
        };
    }, [userCtx.userId, userCtx.authToken]);

    /**
        Emit events to the backend
        @returns The servers response
        @throws Server error
    */
    const emit = useCallback(
        <T extends ClientSE>(event: T, payload: ClientSEPayload[T]): Promise<ClientSEReplies[T] | undefined> => {
            return new Promise((resolve: (response: ClientSEReplies[T] | undefined) => void) => {
                if (!socket || !connected) {
                    return undefined;
                }
                socket.emit(event, payload, (response: ClientSEReplies[T], error?: string) => {
                    if (error) {
                        resolve(undefined);
                    } else {
                        resolve(response);
                    }
                });
            });
        },
        [socket, connected]
    );

    /**
     * Emit a volatile event. These will not queue and are not guaranteed delivery at all.
     * @returns The servers reply
     * @throws Any server error
     */
    const volatileEmit = useCallback(
        <T extends ClientSE>(event: ClientSE, payload: ClientSEPayload[T]): Promise<ClientSEReplies[T] | undefined> => {
            return new Promise((resolve: (response: ClientSEReplies[T] | undefined) => void) => {
                if (!socket || !connected) {
                    return undefined;
                }
                socket.volatile.emit(event, payload, (response: ClientSEReplies[T], error?: string) => {
                    if (error) {
                        resolve(undefined);
                    } else {
                        resolve(response);
                    }
                });
            });
        },
        [socket, connected]
    );

    return (
        <SocketContext.Provider
            value={{
                socket,
                sid: socket?.id,
                connected,
                emit,
                volatileEmit,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export { SocketProvider, useSocket };
