import { Avatar, Button, Menu } from '@mantine/core';
import { fullName } from '@mosaiq/terrazzo-common';
import { useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { useUser } from '@trz/contexts/user-context';
import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router';

export const UserProfileIcon = () => {
    const userCtx = useUser();
    const navigate = useNavigate();
    const unsavedCtx = useUnsavedChanges();

    const handleLogout = useCallback(async () => {
        if (await unsavedCtx.confirmKeepUnsavedChanges()) {
            return;
        }
        userCtx.logoutAll();
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
                {userCtx.userData ? (
                    <Avatar
                        size={'1.75rem'}
                        src={userCtx.userData?.profilePicture}
                        color="initials"
                        name={fullName(userCtx.userData)}
                    />
                ) : (
                    <Button
                        component={Link}
                        to="/login"
                        color="#fafafa"
                        c="#19191b"
                        variant="filled"
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
