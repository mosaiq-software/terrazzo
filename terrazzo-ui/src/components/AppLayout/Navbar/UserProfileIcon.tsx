import { Avatar, Button, Menu } from '@mantine/core';
import { fullName } from '@mosaiq/terrazzo-common';
import { useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { useUserContext } from '@trz/contexts/user-context';
import { useUser } from '@trz/hooks/useUser';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

export const UserProfileIcon = () => {
    const userCtx = useUserContext();
    const navigate = useNavigate();
    const unsavedCtx = useUnsavedChanges();
    const user = useUser(userCtx.userId);

    const handleLogout = useCallback(async () => {
        if (await unsavedCtx.confirmKeepUnsavedChanges()) {
            return;
        }
        userCtx.clearLocalLoginData();
        //TODO: emit logout event to server?
    }, [userCtx, unsavedCtx]);

    const handleNavigateToSettings = useCallback(async () => {
        if (await unsavedCtx.confirmKeepUnsavedChanges()) {
            return;
        }
        navigate('/settings');
    }, [navigate, unsavedCtx]);

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
                {userCtx.userId ? (
                    <Avatar
                        size={'1.75rem'}
                        src={user?.profilePicture}
                        color="initials"
                        name={fullName(user)}
                    />
                ) : (
                    <Button
                        color="#fafafa"
                        c="#19191b"
                        variant="filled"
                        onClick={userCtx.goToLogin}
                    >
                        Login
                    </Button>
                )}
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
