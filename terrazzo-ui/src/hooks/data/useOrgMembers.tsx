import { OrganizationId, RoomSpecifier, RoomType, ServerSE, UserId } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getOrganizationMemberships } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useOrgMembers = (orgId?: OrganizationId) => {
    useRoom(RoomType.DATA, orgId, RoomSpecifier.MEMBERSHIP);
    const [members, setMembers] = useState<UserId[]>([]);
    const sockCtx = useSocket();

    useEffect(() => {
        const fetchMembershipRecords = async () => {
            if (!orgId || !sockCtx.connected) {
                return;
            }
            try {
                const res = await getOrganizationMemberships(sockCtx, orgId);
                if (!res) {
                    throw new Error('Failed to fetch invites');
                }
                setMembers(res);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
                return;
            }
        };
        fetchMembershipRecords();
    }, [orgId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_ORGANIZATION_MEMBERSHIPS,
        (payload) => {
            if (payload.orgId !== orgId) {
                return;
            }
            setMembers([...payload.members]);
        },
        [orgId]
    );

    return members;
};
