import React, { useState } from 'react';
import { Button, Group, Menu, Select, TextInput } from '@mantine/core';
import { NoteType, notify } from '@trz/util/notifications';
import { Role, RoleNames } from '@mosaiq/terrazzo-common/constants';
import { useHotkeys } from '@mantine/hooks';
interface AddUserProps {
    disabled: boolean;
    onSubmit: (username: string, role: Role) => Promise<boolean>;
}
export const AddUser = (props: AddUserProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [role, setRole] = useState<number>(Role.READ);
    const [error, setError] = useState<string>('');

    const onSubmit = async (e) => {
        if (props.disabled) {
            return;
        }
        if (username.trim().length === 0) {
            setUsername('');
            setError('No username provided');
            return;
        }
        setUsername('');
        setRole(Role.READ);
        setError('');
        const success = await props.onSubmit(username, role);
        if (success) {
            notify(NoteType.INVITE_SENT_SUCCESS);
        } else {
            setError('User not found!');
        }
    };

    const onCancel = () => {
        setOpen(false);
        setUsername('');
        setRole(Role.READ);
        setError('');
    };

    useHotkeys([
        ['Enter', onSubmit],
        ['Escape', onCancel],
    ]);

    return (
        <Menu opened={open}>
            <Menu.Target>
                <Button
                    variant="outline"
                    disabled={props.disabled}
                    onClick={() => {
                        setUsername('');
                        setRole(Role.READ);
                        setError('');
                        setOpen(!open);
                    }}
                >
                    + Add Member
                </Button>
            </Menu.Target>
            <Menu.Dropdown
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    flexWrap: 'nowrap',
                    padding: 4,
                }}
            >
                <TextInput
                    label="Username"
                    placeholder=""
                    value={username}
                    error={error}
                    autoFocus
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setError('');
                    }}
                    onSubmit={onSubmit}
                />
                <Select
                    label="Role"
                    placeholder="Role"
                    data={[RoleNames[Role.READ], RoleNames[Role.WRITE], RoleNames[Role.ADMIN]]}
                    value={RoleNames[role]}
                    allowDeselect={false}
                    disabled={props.disabled}
                    onChange={(e) => {
                        setRole(RoleNames.indexOf(e ?? RoleNames[Role.READ]));
                    }}
                />
                <Group>
                    <Button
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="filled"
                        onClick={onSubmit}
                    >
                        Send Invite
                    </Button>
                </Group>
            </Menu.Dropdown>
        </Menu>
    );
};
