import { Center, Container, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { useUserContext } from '@trz/contexts/user-context';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/*
 * This page will only show as the callback from GitHub OAuth flow
 */
export const GithubAuthHandler = () => {
    const userContext = useUserContext();
    const [queryParams] = useSearchParams();
    const code = queryParams.get('code');

    useEffect(() => {
        let strictIgnore = false;
        const handleLogin = async () => {
            await new Promise((res) => setTimeout(res, 200));
            if (strictIgnore) {
                return;
            }
            if (!code) {
                console.error('No code provided in query params');
                return;
            }
        };
        handleLogin();
        return () => {
            strictIgnore = true;
        };
    }, [code, userContext.userId, userContext.authToken]);

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
                        <Text>Hold tight! We&apos;re logging you in with GitHub.</Text>
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
