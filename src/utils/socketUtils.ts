import {RoomId, RoomType} from "../socketTypes";
import { UID } from "../types";
export const getRoomCode = (roomType: RoomType, uid: UID): RoomId => {
    return `${roomType}-${uid}`;
}