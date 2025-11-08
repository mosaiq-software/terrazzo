import React, { useEffect } from 'react';
import { Center, Loader } from '@mantine/core';
import { useUser } from '@trz/contexts/user-context';

interface AuthWrapperProps {
    children: any;
}
export const AuthWrapper = (props: AuthWrapperProps) => {
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

    return props.children;
};
