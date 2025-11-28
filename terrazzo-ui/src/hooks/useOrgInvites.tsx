import { Invite, OrganizationId } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { getAllInvitesForOrg } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';

const FETCH_INTERVAL_MS = 1000 * 60 * 1; // 1 minute
export const useOrgInvites = (orgId?: OrganizationId) => {
    const [invites, setInvites] = useState<Invite[]>([]);
    const sockCtx = useSocket();
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);

    useEffect(() => {
        const fetchInvites = async () => {
            if (!orgId || !sockCtx.connected) {
                return;
            }
            try {
                if (Date.now() - lastFetchTime < FETCH_INTERVAL_MS) {
                    return;
                }
                setLastFetchTime(Date.now());
                const invitesRes = await getAllInvitesForOrg(sockCtx, orgId);
                if (!invitesRes) {
                    throw new Error('Failed to fetch invites');
                }
                setInvites(invitesRes);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
                return;
            }
        };
        fetchInvites();
    }, [orgId, sockCtx.connected]);

    const explicityRefreshInvites = async () => {
        if (!orgId || !sockCtx.connected) {
            return;
        }
        try {
            const invitesRes = await getAllInvitesForOrg(sockCtx, orgId);
            if (!invitesRes) {
                throw new Error('Failed to fetch invites');
            }
            setInvites(invitesRes);
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
            return;
        }
    };

    return { invites, refresh: explicityRefreshInvites };
};
