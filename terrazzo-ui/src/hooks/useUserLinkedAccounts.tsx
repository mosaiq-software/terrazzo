import { LinkedAccount, RoomType, ServerSE, UserId } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getLinkedAccountsForUser } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useUserLinkedAccounts = (userId?: UserId) => {
    useRoom(RoomType.DATA, userId);
    const sockCtx = useSocket();
    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);

    useEffect(() => {
        const fetchLinkedAccounts = async () => {
            if (!userId || !sockCtx.connected) {
                return;
            }
            try {
                const linkedAccountsRes = await getLinkedAccountsForUser(sockCtx, userId);
                setLinkedAccounts(linkedAccountsRes || []);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
                return;
            }
        };
        fetchLinkedAccounts();
    }, [userId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_USERS_LINKED_ACCOUNTS,
        (payload) => {
            if (payload.userId !== userId) {
                return;
            }
            setLinkedAccounts((prev) => {
                if (!prev) {
                    return prev;
                }
                return [...payload.linkedAccounts];
            });
        },
        [userId]
    );

    return linkedAccounts;
};
