import { Button, Center, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { getGithubLoginUrl } from '@trz/util/authUtils';
import { FaGithub } from 'react-icons/fa';
import { DEV_FakeAccountLogin } from './DEV_FakeAccountLogin';

const LoginPage = () => {
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
                        <DEV_FakeAccountLogin />
                    </Stack>
                </Paper>
            </Center>
        </Container>
    );
};

export default LoginPage;
