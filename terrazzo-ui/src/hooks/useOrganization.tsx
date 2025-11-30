import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { Organization, OrganizationId } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { getOrganizationData } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useOrganization = (orgId?: OrganizationId) => {
    const sockCtx = useSocket();
    const [orgData, setOrgData] = useState<Organization | undefined | null>();
    useRoom(RoomType.DATA, orgId, false);

    useEffect(() => {
        const fetchOrgData = async () => {
            if (!orgId || !sockCtx.connected) {
                return;
            }
            try {
                const org = await getOrganizationData(sockCtx, orgId);
                setOrgData(org ?? null);
            } catch (err) {
                notify(NoteType.ORG_DATA_ERROR, err);
                return;
            }
        };
        fetchOrgData();
    }, [orgId, sockCtx.connected]);

    useSocketListener(ServerSE.UPDATE_ORG_FIELD, (payload) => {
        setOrgData((prev) => {
            if (!prev) {
                return prev;
            }
            return updateBaseFromPartial(prev, payload);
        });
    });

    return { orgData };
};
