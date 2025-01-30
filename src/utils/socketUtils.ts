import { Server, Socket } from 'socket.io';
import { UserData } from '@mosaiq/terrazzo-common/socketTypes';


export const getSocketRoom = (socket: Socket) => {
    return Array.from(socket.rooms).find(room => room !== socket.id);
}
export const getAllUsersInRoom = (io: Server, room: string): UserData[] => {
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (!roomSockets) {
        return [];
    }
    const sockets = Array.from(roomSockets);
    const users = sockets.map(socketId => {
        const socket = io.sockets.sockets.get(socketId);
        return socket?.data.user;
    });
    return users as UserData[];
}