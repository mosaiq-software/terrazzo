import { Box, Button, Fieldset, Menu, Stack, Text } from '@mantine/core';
import { ModulePermissions, OverridePermissions, Role, RoleId } from '@mosaiq/terrazzo-common/types';
import { recordKeys } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { RoleTabs } from '@trz/components/Roles/RoleTabs';
import { RoleTag } from '@trz/components/Roles/RoleTag';
import { useOrg } from '@trz/contexts/org-context';
import { completelyCaptureEvent } from '@trz/util/eventUtils';
import { MdAdd } from 'react-icons/md';
import { PermissionsEditorPermissionsList } from './PermissionsEditorPermissionsList';

interface PermissionsEditorProps {
    desiredPermissions: ModulePermissions;
    onChange: (newPermissions: ModulePermissions) => void;
}

export const PermissionsEditor = (props: PermissionsEditorProps) => {
    const orgCtx = useOrg();
    const assignedRoleIds = recordKeys(props.desiredPermissions);
    const assignedRoles = orgCtx.roles.filter((role) => assignedRoleIds.includes(role.id));
    const unAssignedRoles = orgCtx.roles.filter((role) => !assignedRoleIds.includes(role.id));

    const handleChangeRolePerms = (roleId: RoleId, newOverride: OverridePermissions) => {
        props.onChange({
            ...props.desiredPermissions,
            [roleId]: newOverride,
        });
    };

    return (
        <Fieldset legend="Permissions">
            <RoleTabs
                roles={assignedRoles}
                actionButton={
                    <Menu
                        position="bottom-start"
                        withArrow
                        arrowPosition="side"
                        closeOnClickOutside={true}
                        trigger="hover"
                        openDelay={0}
                        closeDelay={200}
                        shadow="md"
                        offset={4}
                    >
                        <Menu.Target>
                            <Button
                                variant="subtle"
                                leftSection={<MdAdd />}
                                justify="flex-start"
                                px={'1rem'}
                                c="white"
                            >
                                Add Role
                            </Button>
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
                                            handleChangeRolePerms(role.id, {});
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
                                        All roles configured
                                    </Box>
                                )}
                            </Stack>
                        </Menu.Dropdown>
                    </Menu>
                }
                noSelectionMessage={orgCtx.roles.length === 0 ? <Text c="dimmed">No roles available. Please create roles in the Organization Settings.</Text> : assignedRoles.length === 0 ? <Text c="dimmed">No roles assigned to this module. Use the "Add Role" button to assign roles.</Text> : <Text c="dimmed">Select a role to view or edit its permissions.</Text>}
                selectedRolePanel={(role: Role) => (
                    <PermissionsEditorPermissionsList
                        rolePermissionsOverride={props.desiredPermissions[role.id]}
                        onChangeOverride={(newOverride) => {
                            handleChangeRolePerms(role.id, newOverride);
                        }}
                    />
                )}
            />
        </Fieldset>
    );
};
