import { Center, Container, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { AuthProvider, UserId } from '@mosaiq/terrazzo-common';
import { useUserContext } from '@trz/contexts/user-context';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

/*
 * This page will only show as the callback from an external auth provider
 */
export const AuthHandlerPage = () => {
    const usr = useUserContext();
    const params = useParams();
    const userId = params.userId as UserId;
    const provider = params.provider as AuthProvider;
    const providerAuthToken = params.providerAuthToken as string;
    const trzAuthToken = params.trzAuthToken as string;

    useEffect(() => {
        let strictIgnore = false;
        const handleLogin = async () => {
            await new Promise((res) => setTimeout(res, 200));
            if (strictIgnore) {
                return;
            }
            usr.handleLogin(userId, trzAuthToken, provider, providerAuthToken);
        };
        handleLogin();
        return () => {
            strictIgnore = true;
        };
    }, []);

    return (
        <Container
            h="100%"
            fluid
            maw="100%"
            p="lg"
            bg="#1d2022"
        >
            <Center>
                <Paper bg={'#0c0c10'}>
                    <Stack
                        px={50}
                        py={30}
                        mih={400}
                        ta="center"
                        c={'#ebebeb'}
                        align="center"
                    >
                        <Title>Working on it...</Title>
                        <Text>Hold tight! We&apos;re logging you in with {provider}.</Text>
                        <Loader
                            type="bars"
                            size="xl"
                        />
                    </Stack>
                </Paper>
            </Center>
        </Container>
    );
};
