import { Button, Center, Container, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { AuthProvider } from '@mosaiq/terrazzo-common';
import { useUserContext } from '@trz/contexts/user-context';
import { COLORS } from '@trz/util/colors';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const USER_DENIED_APPLICATION = {
    error: 'access_denied',
    errorDescription: 'The user has denied your application access.',
};

/*
 * This page will only show as the callback from GitHub OAuth flow
 */
export const GithubAuthHandler = () => {
    const userContext = useUserContext();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // ?error=access_denied
    // &error_description=The+user+has+denied+your+application+access.
    // &error_uri=https%3A%2F%2Fdocs.github.com%2Fapps%2Fmanaging-oauth-apps%2Ftroubleshooting-authorization-request-errors%2F%23access-denied

    useEffect(() => {
        const handleLogin = () => {
            if (!code) {
                console.error('No code provided in query params');
                return;
            }
            userContext.handleLoginFromProvider({
                provider: AuthProvider.Github,
                code: code,
            });
        };

        const timeoutId = setTimeout(() => {
            handleLogin();
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [code, userContext.userId, userContext.authToken]);

    useEffect(() => {
        if (error === USER_DENIED_APPLICATION.error && errorDescription === USER_DENIED_APPLICATION.errorDescription) {
            console.warn('User denied application access during GitHub OAuth flow');
            navigate('/login');
            return;
        } else if (error) {
            console.error(`Error during GitHub OAuth flow: ${error} - ${errorDescription}`);
            return;
        }
    }, [error, errorDescription]);

    return (
        <Container
            h="100%"
            fluid
            maw="100%"
            p="lg"
            bg={COLORS.background.medium}
        >
            <Center>
                <Paper bg={COLORS.background.dark}>
                    <Stack
                        px={50}
                        py={30}
                        mih={400}
                        ta="center"
                        c={COLORS.text.primary}
                        align="center"
                    >
                        {error ? (
                            <>
                                <Title>Error during GitHub login</Title>
                                <Text>{error}</Text>
                                {errorDescription && <Text>{errorDescription}</Text>}
                                <Button
                                    mt={20}
                                    onClick={() => navigate('/login')}
                                >
                                    Back to Login
                                </Button>
                            </>
                        ) : (
                            <>
                                <Title>Working on it...</Title>
                                <Text>Hold tight! We&apos;re logging you in with GitHub.</Text>
                                <Loader
                                    type="bars"
                                    size="xl"
                                />
                            </>
                        )}
                    </Stack>
                </Paper>
            </Center>
        </Container>
    );
};
