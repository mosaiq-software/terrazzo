import { ActionIcon, Badge, Box, Menu, Stack, Text } from '@mantine/core';
import { Role, RoleId, UserId } from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { COLORS } from '@trz/util/colors';
import { completelyCaptureEvent } from '@trz/util/eventUtils';
import { useMemo } from 'react';
import { MdAdd } from 'react-icons/md';
import { RoleTag } from './RoleTag';

interface RolesListAddMenuProps {
    userId: UserId;
    roles: Role[];
    onToggleRole: (roleId: RoleId, state: boolean) => void;
}
export const RolesListAddMenu = (props: RolesListAddMenuProps) => {
    const orgCtx = useOrg();
    const unAssignedRoles = useMemo(
        () => orgCtx.roles.filter((role) => !props.roles.find((r) => r.id === role.id)),
        [orgCtx.roles, props.roles]
    );
    return (
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
                {props.roles.length === 0 ? (
                    <Badge
                        variant="outline"
                        color="gray"
                        style={{
                            backgroundColor: COLORS.transparent,
                            cursor: 'pointer',
                        }}
                        leftSection={
                            <ActionIcon
                                size={12}
                                variant="transparent"
                            >
                                <MdAdd
                                    size={12}
                                    color={COLORS.text.primary}
                                />
                            </ActionIcon>
                        }
                    >
                        Add a role
                    </Badge>
                ) : (
                    <ActionIcon
                        variant="light"
                        color={COLORS.text.muted}
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
                                props.onToggleRole(role.id, true);
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
                        <Text
                            c={COLORS.text.secondary}
                            fz="sm"
                            ta="center"
                            p={8}
                        >
                            All roles assigned
                        </Text>
                    )}
                </Stack>
            </Menu.Dropdown>
        </Menu>
    );
};
