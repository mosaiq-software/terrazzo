import { Invite, InviteId, OrganizationHeader } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getInvite, getOrganizationData } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';

export const useInvite = (inviteId?: InviteId) => {
    const [invite, setInvite] = useState<Invite | undefined>(undefined);
    const [invitingOrg, setInvitingOrg] = useState<OrganizationHeader | undefined>(undefined);
    const sockCtx = useSocket();

    useEffect(() => {
        const fetchInvite = async () => {
            if (!inviteId || !sockCtx.connected) {
                return;
            }
            let inviteRes: Invite | undefined;
            try {
                inviteRes = await getInvite(sockCtx, inviteId);
                if (!inviteRes) {
                    throw new Error('Failed to fetch invite');
                }
                setInvite(inviteRes);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
                return;
            }

            try {
                const orgRes = await getOrganizationData(sockCtx, inviteRes.forOrganizationId);
                if (!orgRes) {
                    throw new Error('Failed to fetch inviting organization');
                }
                setInvitingOrg(orgRes);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
            }
        };
        fetchInvite();
    }, [inviteId, sockCtx.connected]);

    return { invite, invitingOrg };
};
