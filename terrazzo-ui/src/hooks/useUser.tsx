import { RoomType, ServerSE, UserHeader, UserId } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getUserHeader } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useUser = (userId?: UserId) => {
    useRoom(RoomType.DATA, userId);
    const sockCtx = useSocket();
    const [user, setUser] = useState<UserHeader | undefined>(undefined);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId || !sockCtx.connected) {
                return;
            }
            if (user && user.id === userId) {
                return;
            }
            try {
                const userRes = await getUserHeader(sockCtx, userId);
                setUser(userRes);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
                return;
            }
        };
        fetchUserData();
    }, [userId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_USER_FIELD,
        (payload) => {
            if (payload.id !== userId) {
                return;
            }
            setUser((prev) => {
                if (!prev) {
                    return prev;
                }
                return { ...prev, ...payload };
            });
        },
        [userId]
    );

    return user;
};
