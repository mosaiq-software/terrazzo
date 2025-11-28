import { Divider, Menu } from '@mantine/core';
import { UserHeader } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { useUser } from '@trz/contexts/user-context';
import { useDev } from './devContext';

interface DO_NOT_IMPORT_DevUserSwitcherMenuProps {}

export const DO_NOT_IMPORT_DevUserSwitcherMenu = (props: DO_NOT_IMPORT_DevUserSwitcherMenuProps) => {
    const devCtx = useDev();
    const userCtx = useUser();
    const handleClickCreateUser = () => {
        devCtx.DEV_createDevUser();
    };
    const handleClickSwitchUser = (header: UserHeader) => {
        devCtx.DEV_setSelectedUserOverride(header);
    };
    const handleClickSwitchToMe = () => {
        devCtx.DEV_setSelectedUserOverride(null);
    };

    return (
        <Menu
            trigger="hover"
            position="left-start"
        >
            <Menu.Target>
                <Menu.Item>[DEV] Switch User</Menu.Item>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    onClick={handleClickSwitchToMe}
                    bg={devCtx.DEV_selectedUserOverride ? undefined : 'green'}
                >{`Real Me`}</Menu.Item>
                {devCtx.DEV_allDevUsers.map((header) => (
                    <Menu.Item
                        key={header.id}
                        onClick={() => {
                            handleClickSwitchUser(header);
                        }}
                        bg={devCtx.DEV_selectedUserOverride?.id === header.id ? 'green' : undefined}
                    >
                        {fullName(header)}
                    </Menu.Item>
                ))}
                <Divider />
                <Menu.Item onClick={handleClickCreateUser}>Create User</Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};
