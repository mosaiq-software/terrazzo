import { Avatar, Menu, UnstyledButton } from '@mantine/core';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { useUser } from '@trz/contexts/user-context';
import React from 'react';
import { useNavigate } from 'react-router';

export const UserProfileIcon = () => {
    const usr = useUser();
    const navigate = useNavigate();

    return (
        <Menu
            transitionProps={{ transition: 'fade-down', duration: 150 }}
            position="bottom-end"
            offset={2}
            withArrow
            arrowPosition="center"
        >
            <Menu.Target>
                <UnstyledButton
                    onClick={() => {
                        console.log('User profile...');
                    }}
                >
                    <Avatar
                        size={'1.75rem'}
                        src={usr.userData?.profilePicture}
                        color="initials"
                        name={fullName(usr.userData)}
                    />
                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    onClick={() => {
                        navigate('/settings');
                    }}
                >
                    Settings
                </Menu.Item>
                <Menu.Item
                    color="red"
                    onClick={() => {
                        usr.logoutAll();
                    }}
                >
                    Logout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};
