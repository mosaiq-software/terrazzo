import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { OrganizationId, RoleId, UserId } from '@mosaiq/terrazzo-common/types';
import { RoomSpecifier } from '@mosaiq/terrazzo-common/utils/socketUtils';
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
    const [roleIds, setRoleIds] = useState<RoleId[]>([]);
    const sockCtx = useSocket();

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
            console.log('Received UPDATE_ROLES_FOR_USER_IN_ORG payload:', payload, 'for userId:', userId, 'and orgId:', orgId);
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
