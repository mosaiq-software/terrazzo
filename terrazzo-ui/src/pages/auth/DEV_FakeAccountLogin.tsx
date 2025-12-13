import { Button, Divider, Stack, TextInput } from '@mantine/core';
import { RestRoutes, UserHeader } from '@mosaiq/terrazzo-common';
import { useUser } from '@trz/contexts/user-context';
import { callTrzApi } from '@trz/util/apiUtils';
import { isDev } from '@trz/util/envUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { useState } from 'react';
import { FaCodeBranch } from 'react-icons/fa';
import { useNavigate } from 'react-router';

export const DEV_FakeAccountLogin = () => {
    const usr = useUser();
    const navigate = useNavigate();

    const [username, setUsername] = useState<string>('');

    if (!isDev()) {
        return null;
    }

    const handleDevLogin = async () => {
        try {
            const userHeader = (await callTrzApi<RestRoutes.USER_FAKE_DEV>(RestRoutes.USER_FAKE_DEV, { username }, undefined)) as UserHeader | undefined;
            if (!userHeader) {
                throw new Error('Failed to login as user');
            }
            usr.devLogin(userHeader);
            navigate('/dashboard');
        } catch (e: any) {
            notify(NoteType.GENERIC_ERROR, {
                username,
                e,
            });
        }
    };

    return (
        <Stack>
            <Divider label="DEV ONLY" />
            <TextInput
                label="Username"
                value={username}
                onChange={(e) => {
                    setUsername(e.target.value);
                }}
            />
            <Button
                leftSection={<FaCodeBranch />}
                variant="light"
                onClick={handleDevLogin}
            >
                Login with Dev Account
            </Button>
        </Stack>
    );
};
