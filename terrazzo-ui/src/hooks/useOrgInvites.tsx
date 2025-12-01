import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { Invite, OrganizationId } from '@mosaiq/terrazzo-common/types';
import { RoomSpecifier } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { getAllInvitesForOrg } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useOrgInvites = (orgId?: OrganizationId) => {
    useRoom(RoomType.DATA, orgId, RoomSpecifier.INVITES);
    const [invites, setInvites] = useState<Invite[]>([]);
    const sockCtx = useSocket();

    useEffect(() => {
        const fetchInvites = async () => {
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
        fetchInvites();
    }, [orgId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_ORGANIZATION_INVITES,
        (payload) => {
            if (payload.orgId !== orgId) {
                return;
            }
            setInvites(payload.invites);
        },
        [orgId]
    );

    return invites;
};
