import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientSE, ClientSEPayload, ClientSEReplies, ClientSocketIOEvent, ServerSE, ServerSEPayload, SocketHandshakeAuth, SocketId } from '@mosaiq/terrazzo-common/socketTypes';
import { UserHeader, UserId } from '@mosaiq/terrazzo-common/types';
import { NoteType, notify } from '@trz/util/notifications';
import { useUser } from './user-context';

export type SocketContextType = {
    socket: Socket | null;
    sid: SocketId | undefined;
    connected: boolean;
    emit<T extends ClientSE>(event: T, payload: ClientSEPayload[T]): Promise<ClientSEReplies[T] | undefined>;
    volatileEmit: <T extends ClientSE>(event: ClientSE, payload: ClientSEPayload[T]) => Promise<ClientSEReplies[T] | undefined>;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SocketProvider: React.FC<any> = ({ children }) => {
    const usr = useUser();
    const [socket, setSocketState] = useState<Socket | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    // const [userLookup, setUserLookup] = useState<{[userId:UserId]:UserHeader}>({});

    useEffect(() => {
        if (!process.env.SOCKET_URL) {
            throw new Error('SOCKET_URL environment variable is not set');
        }
        if (!usr.userData?.id || !usr.githubAuthToken) {
            return;
        }

        // CREATE SOCKET CONNECTION
        const auth: SocketHandshakeAuth = {
            userId: usr.userData.id,
            githubToken: usr.githubAuthToken,
        };
        const sock = io(process.env.SOCKET_URL, {
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

        sock.on(ClientSocketIOEvent.DISCONNECT, () => {
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
            console.warn('Effect closed');
            sock.disconnect();
        };
    }, [usr.userData?.id, usr.githubAuthToken]);

    /**
        Emit events to the backend
        @returns The servers response
        @throws Server error
    */
    function emit<T extends ClientSE>(event: T, payload: ClientSEPayload[T]): Promise<ClientSEReplies[T] | undefined> {
        return new Promise((resolve: (response: ClientSEReplies[T]) => void, reject: (error?: string) => void) => {
            if (!socket || !connected) {
                return null;
            }
            socket.emit(event, payload, (response: ClientSEReplies[T], error?: string) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Emit a volatile event. These will not queue and are not guaranteed delivery at all.
     * @returns The servers reply
     * @throws Any server error
     */
    function volatileEmit<T extends ClientSE>(event: ClientSE, payload: ClientSEPayload[T]): Promise<ClientSEReplies[T] | undefined> {
        return new Promise((resolve: (response: ClientSEReplies[T]) => void, reject: (error?: string) => void) => {
            if (!socket || !connected) {
                return null;
            }
            socket.volatile.emit(event, payload, (response: ClientSEReplies[T], error?: string) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // EVENT EMITTERS

    // const lookupUser = async (userId:UserId):Promise<UserHeader | undefined> => {
    //     const cached = userLookup[userId];
    //     if(cached){
    //         return cached;
    //     }
    //     const fetched = await getUserHeader(userId);
    //     return fetched;
    // }

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
