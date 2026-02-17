import { OrganizationId, RoleId, RoomSpecifier, RoomType, ServerSE, UserId } from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { getRoleIdsForUserInOrg } from '@trz/emitters/roleEmitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useMemo, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useRoleForUserInOrg = (userId: UserId | undefined, orgId: OrganizationId | undefined) => {
    const roomKey = orgId && userId ? `${orgId}_${userId}` : undefined;
    useRoom(RoomType.DATA, roomKey, RoomSpecifier.ROLE_ASSIGNMENTS);
    const orgCtx = useOrg();
    const sockCtx = useSocket();
    const [roleIds, setRoleIds] = useState<RoleId[]>([]);

    useEffect(() => {
        const fetchRoleIds = async () => {
            if (!orgId || !userId || !sockCtx.connected) {
                return;
            }
            try {
                const res = await getRoleIdsForUserInOrg(sockCtx, userId, orgId);
                if (!res) {
                    throw new Error('Failed to fetch role ids');
                }
                setRoleIds(res);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
                return;
            }
        };
        fetchRoleIds();
    }, [orgId, userId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_ROLES_FOR_USER_IN_ORG,
        (payload) => {
            if (payload.orgId !== orgId || payload.userId !== userId) {
                return;
            }
            setRoleIds([...payload.roleIds]);
        },
        [orgId, userId]
    );

    const roles = useMemo(() => {
        if (!orgCtx.roles) {
            return [];
        }
        return orgCtx.roles.filter((role) => roleIds.includes(role.id));
    }, [orgCtx.roles, roleIds]);

    return { roleIds, roles };
};
