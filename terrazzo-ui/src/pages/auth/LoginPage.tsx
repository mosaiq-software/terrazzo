import React from 'react';
import { Button, Center, Container, Paper, Stack, Title, Text, Space, Checkbox } from '@mantine/core';
import { getGithubLoginUrl } from '@trz/util/githubAuth';
import { FaGithub } from 'react-icons/fa';
import { useSessionStorage } from '@mantine/hooks';

interface LoginPageProps {}
const LoginPage = (props: LoginPageProps) => {
    const [rememberMe, setRememberMe] = useSessionStorage({ key: 'remember-me' });
    const onRememberMe = (remember: boolean) => {
        setRememberMe(remember ? 'true' : 'false');
    };

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
                    >
                        <Title>Login</Title>
                        <Text>Login to access Terrazzo</Text>
                        <Button
                            leftSection={<FaGithub />}
                            variant="gradient"
                            gradient={{ from: 'rgba(8, 42, 115, 1)', to: 'rgba(96, 3, 138, 1)', deg: 270 }}
                            onClick={() => {
                                window.location.href = getGithubLoginUrl();
                            }}
                        >
                            Login With Github
                        </Button>
                        <Space />
                        <Checkbox
                            label="Remember me"
                            checked={rememberMe !== 'false'}
                            onChange={(e) => {
                                onRememberMe(e.currentTarget.checked);
                            }}
                        />
                    </Stack>
                </Paper>
            </Center>
        </Container>
    );
};

export default LoginPage;
