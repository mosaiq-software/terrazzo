import { Button, ColorInput, Divider, Group, Stack, Title } from '@mantine/core';
import { PermissionFlag, PermissionFlagData, Role, RoleId, withPermissionFlag } from '@mosaiq/terrazzo-common';
import { useCallback, useEffect, useState } from 'react';
import { MdOutlineDelete } from 'react-icons/md';
import EditableTextbox from '../UI/EditableTextbox';
import { RingHoldingButton } from '../UI/RingHoldingButton';
import { PermissionToggle } from './PermissionToggle';

interface RoleEditorProps {
    role: Role;
    onSave: (updatedRole: Role) => void;
    onDelete: (roleId: RoleId) => void;
}
export const RoleEditor = (props: RoleEditorProps) => {
    const [editingRole, setEditingRole] = useState<Role>(props.role);

    const changed = editingRole.name !== props.role.name || editingRole.color !== props.role.color || editingRole.defaultPermissions.sort().join() !== props.role.defaultPermissions.sort().join();

    useEffect(() => {
        setEditingRole(props.role);
    }, [props.role]);

    const handleSave = useCallback(() => {
        props.onSave(editingRole);
    }, [editingRole, props]);

    const change = useCallback(<K extends keyof Role>(field: K, value: Role[K]) => {
        setEditingRole((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    return (
        <Stack
            px={'md'}
            gap="lg"
            style={{
                width: '100%',
            }}
        >
            <Group
                justify="space-between"
                align="center"
            >
                <Stack gap="sm">
                    <EditableTextbox
                        type="title"
                        value={editingRole.name}
                        showEditIcon
                        placeholder="new role"
                        onChange={(newName) => {
                            change('name', newName);
                        }}
                        titleProps={{
                            order: 4,
                            c: 'white',
                        }}
                    />
                    <ColorInput
                        value={editingRole.color}
                        onChange={(e) => change('color', e)}
                    />
                </Stack>
                <Button
                    disabled={!changed}
                    onClick={handleSave}
                    w="fit-content"
                >
                    Save Changes
                </Button>
            </Group>
            <Divider />
            <Title order={5}>Default Role Permissions</Title>
            <Stack gap="md">
                {Object.values(PermissionFlag).map((permission) => {
                    const permData = PermissionFlagData[permission];
                    const enabled = editingRole.defaultPermissions.includes(permission);
                    return (
                        <PermissionToggle
                            key={permission}
                            permissionName={permData.title}
                            permissionDescription={permData.description}
                            isEnabled={enabled}
                            onToggle={(checked) => {
                                change('defaultPermissions', withPermissionFlag(editingRole.defaultPermissions, permission, checked));
                            }}
                        />
                    );
                })}
            </Stack>
            <Divider />
            <Title order={5}>Danger Zone</Title>
            <Group>
                <RingHoldingButton
                    tooltip="Hold to delete role"
                    durationMs={1000}
                    ringSize={50}
                    ringThickness={6}
                    color="red"
                    onClick={async () => {
                        props.onDelete(props.role.id);
                    }}
                >
                    <MdOutlineDelete />
                </RingHoldingButton>
            </Group>
        </Stack>
    );
};
