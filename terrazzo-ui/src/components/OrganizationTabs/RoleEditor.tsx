import { Button, ColorInput, Group, Stack } from '@mantine/core';
import { Role, RoleId } from '@mosaiq/terrazzo-common/types';
import { useCallback, useEffect, useState } from 'react';
import { MdOutlineDelete } from 'react-icons/md';
import EditableTextbox from '../EditableTextbox';
import { RingHoldingButton } from '../UI/RingHoldingButton';

interface RoleEditorProps {
    role: Role;
    onSave: (updatedRole: Role) => void;
    onDelete: (roleId: RoleId) => void;
}
export const RoleEditor = (props: RoleEditorProps) => {
    const [editingRole, setEditingRole] = useState<Role>(props.role);

    const changed = editingRole.name !== props.role.name || editingRole.color !== props.role.color;

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
            gap="md"
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
                <RingHoldingButton
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
            <Stack gap="sm">{/* TODO Permissions editor */}</Stack>
            <Button
                disabled={!changed}
                onClick={handleSave}
            >
                Save Changes
            </Button>
        </Stack>
    );
};
