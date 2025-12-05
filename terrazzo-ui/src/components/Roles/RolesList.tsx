import { ActionIcon, Badge, Box, Group, GroupProps, Menu, Stack } from '@mantine/core';
import { RoleId, UserId } from '@mosaiq/terrazzo-common/types';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { setRoleIdsForUserInOrg } from '@trz/emitters/roleEmitters';
import { useRoleForUserInOrg } from '@trz/hooks/useRolesForUserInOrg';
import { completelyCaptureEvent } from '@trz/util/eventUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { useCallback, useMemo } from 'react';
import { MdAdd } from 'react-icons/md';
import { RoleTag } from './RoleTag';

interface RolesListProps {
    userId: UserId;
    containerProps?: GroupProps;
}
export const RolesList = (props: RolesListProps) => {
    const orgCtx = useOrg();
    const { roles } = useRoleForUserInOrg(props.userId, orgCtx.active?.id);
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

    const unAssignedRoles = useMemo(() => orgCtx.roles.filter((role) => !roles.find((r) => r.id === role.id)), [orgCtx.roles, roles]);
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
            <Menu
                position="bottom-start"
                withArrow
                arrowPosition="side"
                closeOnClickOutside={true}
                trigger="click"
                openDelay={0}
                closeDelay={200}
                shadow="md"
                offset={4}
            >
                <Menu.Target>
                    {roles.length === 0 ? (
                        <Badge
                            variant="outline"
                            color="gray"
                            style={{
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                            }}
                            leftSection={
                                <ActionIcon
                                    size={12}
                                    variant="transparent"
                                >
                                    <MdAdd
                                        size={12}
                                        color="white"
                                    />
                                </ActionIcon>
                            }
                        >
                            Add a role
                        </Badge>
                    ) : (
                        <ActionIcon
                            variant="light"
                            color="gray"
                            size="sm"
                            radius="xl"
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            <MdAdd size={16} />
                        </ActionIcon>
                    )}
                </Menu.Target>
                <Menu.Dropdown miw="12rem">
                    <Menu.Label>Add Roles</Menu.Label>
                    <Stack
                        gap={6}
                        p="xs"
                    >
                        {unAssignedRoles.map((role) => (
                            <Box
                                key={role.id}
                                onClick={(e) => {
                                    completelyCaptureEvent(e);
                                    handleToggleRole(role.id, true);
                                }}
                                style={{
                                    cursor: 'pointer',
                                }}
                            >
                                <RoleTag
                                    role={role}
                                    variant="item"
                                />
                            </Box>
                        ))}
                        {unAssignedRoles.length === 0 && (
                            <Box
                                style={{
                                    color: '#888',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    padding: '8px',
                                }}
                            >
                                All roles assigned
                            </Box>
                        )}
                    </Stack>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
};
