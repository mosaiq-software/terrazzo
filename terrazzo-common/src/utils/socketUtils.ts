import { UID, NonEmptyArray } from '../types/genericTypes';
import { RoomId, RoomSpecifier, RoomType } from '../types/socket/roomTypes';

export const getRoomCode = (
    roomType: RoomType,
    uid: UID | string,
    specifier: string = RoomSpecifier.DEFAULT
): RoomId => {
    return `${roomType}@${uid}@${specifier}`;
};

/**
 * Get the RoomType for a RoomId. Null if no room type exists.
 * This does not check if the value is a valid RoomType
 */
export const getRoomType = (roomId: RoomId): RoomType => {
    return (roomId?.split('@')[0] as RoomType) || RoomType.INVALID_DO_NOT_USE;
};

export const allRoomTypes = (): NonEmptyArray<RoomType> =>
    Object.values(RoomType).filter((r) => r !== RoomType.INVALID_DO_NOT_USE) as any;
