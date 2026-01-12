import { Button, ColorInput, Divider, Group, Stack, Title } from '@mantine/core';
import { PermissionFlagData, Role, RoleId, withPermissionFlag } from '@mosaiq/terrazzo-common';
import { Savable, useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { COLORS } from '@trz/util/colors';
import { useCallback, useEffect, useState } from 'react';
import { MdOutlineDelete } from 'react-icons/md';
import EditableTextbox from '../UI/EditableTextbox';
import { RingHoldingButton } from '../UI/RingHoldingButton';
import { PermissionFlagGrouper } from './PermissionFlagGrouper';
import { PermissionToggle } from './PermissionToggle';

interface RoleEditorProps {
    role: Role;
    onSave: (updatedRole: Role) => void;
    onDelete: (roleId: RoleId) => void;
}
export const RoleEditor = (props: RoleEditorProps) => {
    const [editingRole, setEditingRole] = useState<Role>(props.role);
    const unsavedCtx = useUnsavedChanges();

    const isChanged = useCallback(
        (edited: Role) => {
            return (
                edited.name !== props.role.name ||
                edited.color !== props.role.color ||
                edited.defaultPermissions.sort().join() !== props.role.defaultPermissions.sort().join()
            );
        },
        [props.role]
    );

    useEffect(() => {
        setEditingRole(props.role);
    }, [props.role]);

    const handleSave = useCallback(() => {
        props.onSave(editingRole);
    }, [editingRole, props]);

    const change = useCallback(
        <K extends keyof Role>(field: K, value: Role[K]) => {
            const updatedRole = { ...editingRole, [field]: value };
            setEditingRole(updatedRole);
            unsavedCtx.setSavedState(Savable.RoleSettings, !isChanged(updatedRole));
        },
        [editingRole, isChanged, unsavedCtx]
    );

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
                            c: COLORS.text.primary,
                        }}
                    />
                    <ColorInput
                        value={editingRole.color}
                        onChange={(e) => change('color', e)}
                    />
                </Stack>
                <Button
                    disabled={!isChanged(editingRole)}
                    onClick={handleSave}
                    w="fit-content"
                >
                    Save Changes
                </Button>
            </Group>
            <Divider />
            <Title order={5}>Default Role Permissions</Title>
            <Stack gap="md">
                <PermissionFlagGrouper
                    permissionItem={(permission) => {
                        const permData = PermissionFlagData[permission];
                        const enabled = editingRole.defaultPermissions.includes(permission);
                        return (
                            <PermissionToggle
                                key={permission}
                                permissionName={permData.title}
                                permissionDescription={permData.description}
                                isEnabled={enabled}
                                onToggle={(checked) => {
                                    change(
                                        'defaultPermissions',
                                        withPermissionFlag(editingRole.defaultPermissions, permission, checked)
                                    );
                                }}
                            />
                        );
                    }}
                />
            </Stack>
            <Title order={5}>Danger Zone</Title>
            <Group>
                <RingHoldingButton
                    tooltip="Hold to delete role"
                    durationMs={1000}
                    ringSize={50}
                    ringThickness={6}
                    color={COLORS.semantic.error}
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
