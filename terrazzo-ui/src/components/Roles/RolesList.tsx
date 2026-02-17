import { Group, GroupProps } from '@mantine/core';
import { PermissibleAction, RoleId, UserId } from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { setRoleIdsForUserInOrg } from '@trz/emitters/roleEmitters';
import { useOrgPermission } from '@trz/hooks/data/usePermissions';
import { useRoleForUserInOrg } from '@trz/hooks/useRolesForUserInOrg';
import { NoteType, notify } from '@trz/util/notifications';
import { useCallback } from 'react';
import { RolesListAddMenu } from './RolesListAddMenu';
import { RoleTag } from './RoleTag';

interface RolesListProps {
    userId: UserId;
    containerProps?: GroupProps;
}
export const RolesList = (props: RolesListProps) => {
    const orgCtx = useOrg();
    const { roles } = useRoleForUserInOrg(props.userId, orgCtx.active?.id);
    const userCanManageRoles = useOrgPermission(orgCtx.active?.id, PermissibleAction.AssignRoles);
    const sockCtx = useSocket();

    const handleToggleRole = useCallback(
        async (roleId: RoleId, state: boolean) => {
            if (!orgCtx.active?.id) {
                throw new Error('No active organization');
            }
            try {
                let updatedRoleIds: RoleId[] = [];
                if (state) {
                    updatedRoleIds = [...roles.map((r) => r.id), roleId];
                } else {
                    updatedRoleIds = roles.filter((r) => r.id !== roleId).map((r) => r.id);
                }
                await setRoleIdsForUserInOrg(sockCtx, props.userId, orgCtx.active.id, updatedRoleIds);
            } catch (error) {
                notify(NoteType.GENERIC_ERROR, error);
                console.error('Error updating roles for user:', error);
            }
        },
        [roles, sockCtx, props.userId, orgCtx.active?.id]
    );

    return (
        <Group
            gap="xs"
            {...props.containerProps}
        >
            {roles.map((role) => (
                <RoleTag
                    key={role.id}
                    role={role}
                    onRemove={() => {
                        handleToggleRole(role.id, false);
                    }}
                />
            ))}
            {userCanManageRoles && (
                <RolesListAddMenu
                    userId={props.userId}
                    roles={roles}
                    onToggleRole={handleToggleRole}
                />
            )}
        </Group>
    );
};
