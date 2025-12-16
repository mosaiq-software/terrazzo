import { Avatar, Menu, UnstyledButton } from '@mantine/core';
import { fullName } from '@mosaiq/terrazzo-common';
import { useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { useUser } from '@trz/contexts/user-context';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

export const UserProfileIcon = () => {
    const usr = useUser();
    const navigate = useNavigate();
    const unsavedCtx = useUnsavedChanges();

    const handleLogout = useCallback(async () => {
        if (await unsavedCtx.confirmKeepUnsavedChanges()) {
            return;
        }
        usr.logoutAll();
    }, [usr]);

    const handleNavigateToSettings = useCallback(async () => {
        if (await unsavedCtx.confirmKeepUnsavedChanges()) {
            return;
        }
        navigate('/settings');
    }, [navigate]);

    return (
        <Menu
            transitionProps={{ transition: 'fade-down', duration: 150 }}
            position="bottom-end"
            offset={2}
            withArrow
            arrowPosition="center"
            trigger="hover"
        >
            <Menu.Target>
                <UnstyledButton onClick={() => {}}>
                    <Avatar
                        size={'1.75rem'}
                        src={usr.userData?.profilePicture}
                        color="initials"
                        name={fullName(usr.userData)}
                    />
                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item onClick={handleNavigateToSettings}>Settings</Menu.Item>
                <Menu.Item
                    color="red"
                    onClick={handleLogout}
                >
                    Logout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};
