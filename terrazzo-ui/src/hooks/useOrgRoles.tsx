import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { OrganizationId, Role } from '@mosaiq/terrazzo-common/types';
import { RoomSpecifier } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { getRolesForOrg } from '@trz/emitters/roleEmitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useOrgRoles = (orgId?: OrganizationId) => {
    useRoom(RoomType.DATA, orgId, RoomSpecifier.ROLES);
    const [roles, setRoles] = useState<Role[]>([]);
    const sockCtx = useSocket();

    useEffect(() => {
        const fetchRoles = async () => {
            if (!orgId || !sockCtx.connected) {
                return;
            }
            try {
                const rolesRes = await getRolesForOrg(sockCtx, orgId);
                if (!rolesRes) {
                    throw new Error('Failed to fetch roles');
                }
                setRoles(rolesRes);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
                return;
            }
        };
        fetchRoles();
    }, [orgId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_ORGANIZATION_ROLES,
        (payload) => {
            if (payload.orgId !== orgId) {
                return;
            }
            setRoles(payload.roles);
        },
        [orgId]
    );

    return roles;
};
