import { Member, OrganizationId, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getOrganizationMemberships } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useOrgMembers = (orgId?: OrganizationId) => {
    useRoom(RoomType.DATA, orgId, RoomSpecifier.MEMBERSHIP);
    const [members, setMembers] = useState<Member[]>([]);
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

    useSocketListener(ServerSE.UPDATE_USER_FIELD, (payload) => {
        setMembers((prevMembers) =>
            prevMembers.map((mem) => {
                if (mem.userId === payload.id) {
                    return { ...mem, user: { ...mem.user, ...payload } };
                }
                return mem;
            })
        );
    });

    return members;
};
