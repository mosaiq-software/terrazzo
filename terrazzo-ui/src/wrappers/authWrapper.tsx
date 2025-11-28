import { Center, Loader } from '@mantine/core';
import { useUser } from '@trz/contexts/user-context';
import { useEffect } from 'react';
import { Outlet } from 'react-router';

export const AuthWrapper = () => {
    const usr = useUser();

    useEffect(() => {
        const tryLogin = async () => {
            await usr.githubLogin(undefined);
        };
        if (!usr.userData) {
            tryLogin();
        }
    }, []);

    if (!usr.userData) {
        return (
            <Center
                w="100%"
                h="100%"
            >
                <Loader type="bars" />
            </Center>
        );
    }

    return <Outlet />;
};
