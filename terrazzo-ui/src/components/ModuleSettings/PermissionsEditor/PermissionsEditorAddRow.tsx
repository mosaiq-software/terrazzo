import { Avatar, Combobox, Group, InputBase, Text, useCombobox } from '@mantine/core';
import { PermissionLevel, UserHeader } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { useState } from 'react';

interface PermissionEditorAddRowProps {
    addableUsers: UserHeader[];
    onAddUser: (user: UserHeader, level: PermissionLevel) => void;
}
export const PermissionsEditorAddRow = (props: PermissionEditorAddRowProps) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const [search, setSearch] = useState('');

    const filteredUsers = props.addableUsers.filter((user) => fullName(user).toLowerCase().includes(search.toLowerCase()));

    const options = filteredUsers.map((user) => (
        <Combobox.Option
            key={user.id}
            value={user.id}
        >
            <Group gap="sm">
                <Avatar
                    src={user.profilePicture}
                    alt={fullName(user)}
                    size={20}
                >
                    {fullName(user).charAt(0).toUpperCase()}
                </Avatar>
                <Text>{fullName(user)}</Text>
            </Group>
        </Combobox.Option>
    ));

    return (
        <Group>
            <Combobox
                store={combobox}
                onOptionSubmit={(value) => {
                    const userToAdd = props.addableUsers.find((user) => user.id === value);
                    if (userToAdd) {
                        props.onAddUser(userToAdd, PermissionLevel.VIEW);
                        setSearch('');
                        combobox.closeDropdown();
                    }
                }}
            >
                <Combobox.Target>
                    <InputBase
                        label="Add Member"
                        placeholder="Search members..."
                        value={search}
                        onChange={(event) => {
                            setSearch(event.currentTarget.value);
                            combobox.openDropdown();
                            combobox.updateSelectedOptionIndex();
                        }}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => {
                            combobox.closeDropdown();
                            setSearch('');
                        }}
                        rightSection={<Combobox.Chevron />}
                        rightSectionPointerEvents="none"
                    />
                </Combobox.Target>

                <Combobox.Dropdown>
                    <Combobox.Options>{options.length > 0 ? options : <Combobox.Empty>No members found</Combobox.Empty>}</Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </Group>
    );
};
