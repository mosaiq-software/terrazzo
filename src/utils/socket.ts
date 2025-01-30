import { Server } from 'socket.io';
import { getOrgMemberIds, getPrivateGitHubUserData } from '../controllers/userController';
import { ServerSocketIOEvent, SocketData, SocketEventTypes, SocketEventPayload } from '@mosaiq/terrazzo-common/socketTypes';
import { getAllUsersInRoom, getSocketRoom } from './socketUtils';

const initSockets = () => {
    console.info("Starting sockets");

    const io = new Server({
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 1 * 60 * 1000, // 1 minutes
            skipMiddlewares: true,
        },
    });


    io.on(ServerSocketIOEvent.CONNECTION, async (socket) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                throw new Error('No token provided');
            }
            const userData = await getPrivateGitHubUserData(token);
            if (!userData) {
                throw new Error('Invalid token');
            }
            const orgMembers = await getOrgMemberIds(process.env.ORG_NAME!, token);
            if (!orgMembers.includes(userData.id)) {
                throw new Error('User not in organization: ' + process.env.ORG_NAME);
            }

            const socketData: SocketData = {
                connectedAt: new Date(),
                access_token: token,
                user: {
                    sid: socket.id,
                    githubId: userData.id,
                    username: userData.login,
                    avatarUrl: userData.avatar_url,
                    fullName: userData.name,
                    idle: false,
                    mouse: {},
                }
            };
            socket.data = socketData;
        } catch (error) {
            console.error('Error validating token:', error);
            socket.disconnect(true);
        }
            

        // INITIALIZATION on connection
        try {
            const initRoom = socket.handshake.auth.room;
            const roomUsers = getAllUsersInRoom(io, initRoom);
            if (initRoom && typeof initRoom === 'string') {
                socket.join(initRoom);
            }
            socket.emit(SocketEventTypes.INITIALIZE, { roomUsers });
            socket.broadcast.to(initRoom).emit(SocketEventTypes.CLIENT_CONNECT, socket.data.user);
        } catch (error) {
            console.error('Error initializing socket:', error);
            socket.disconnect(true);
        }

        // SERVER EVENTS
        socket.on(SocketEventTypes.CHANGE_ROOM, (room, callback) => {
            const currentRoom = getSocketRoom(socket);
            if (currentRoom) {
                socket.leave(currentRoom);
                const payload: SocketEventPayload[SocketEventTypes.CLIENT_DISCONNECT] = {
                    sid: socket.id,
                    room: currentRoom,
                }
                socket.broadcast.to(currentRoom).emit(SocketEventTypes.CLIENT_DISCONNECT, payload);
            }

            if (room && typeof room === 'string') {
                const roomUsers = getAllUsersInRoom(io, room);
                socket.join(room);
                socket.broadcast.to(room).emit(SocketEventTypes.CLIENT_CONNECT, socket.data.user);
                callback({
                    error: false,
                    roomUsers,
                })
            }
        });

        socket.on(ServerSocketIOEvent.DISCONNECTING, (reason) => {
            const currentRoom = getSocketRoom(socket);
            if (currentRoom) {
                const payload: SocketEventPayload[SocketEventTypes.CLIENT_DISCONNECT] = {
                    sid: socket.id,
                    room: currentRoom,
                }
                socket.broadcast.to(currentRoom).emit(SocketEventTypes.CLIENT_DISCONNECT, payload);
            }
        });
            
        socket.on(ServerSocketIOEvent.DISCONNECT, () => {
        });


        // CUSTOM EVENTS
        socket.on(SocketEventTypes.MOUSE_MOVE, (data: SocketEventPayload[SocketEventTypes.MOUSE_MOVE]) => {
            socket.data.user.mouse = { x: data.x, y: data.y };
            data.sid = socket.id;
            const room = getSocketRoom(socket);
            if (room) {
                socket.broadcast.to(room).emit(SocketEventTypes.MOUSE_MOVE, data);
            }
        });

        socket.on(SocketEventTypes.USER_IDLE, (data: SocketEventPayload[SocketEventTypes.USER_IDLE]) => {
            socket.data.user.idle = data.idle;
            data.sid = socket.id;
            const room = getSocketRoom(socket);
            if (room) {
                socket.broadcast.to(room).emit(SocketEventTypes.USER_IDLE, data);
            }
        });
    });

    return { io };
}

export { initSockets };