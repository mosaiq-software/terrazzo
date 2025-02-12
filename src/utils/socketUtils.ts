import {RoomId, RoomType} from "../socketTypes";
export const getRoomCode = (roomType: RoomType, uid: string): RoomId => {
    return `${roomType}-${uid}`;
}