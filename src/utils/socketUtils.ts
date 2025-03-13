import {RoomId, RoomType} from "../socketTypes";
import { NonEmptyArray, UID } from "../types";

export const getRoomCode = (roomType: RoomType, uid: UID): RoomId => {
    return `${roomType}@${uid}`;
}

/**
 * Get the RoomType for a RoomId. Null if no room type exists.
 * This does not check if the value is a valid RoomType
 */
export const getRoomType = (roomId: RoomId): RoomType =>{
    return (roomId?.split("@")[0] as RoomType) || RoomType.INVALID_DO_NOT_USE;
}

export const allRoomTypes = (): NonEmptyArray<RoomType> => Object.values(RoomType).filter(r=>r!==RoomType.INVALID_DO_NOT_USE) as any;