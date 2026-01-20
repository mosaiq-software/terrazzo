import { Button, Center, Paper, Stack, Text, Title } from '@mantine/core';
import { getGithubLoginUrl } from '@trz/util/authUtils';
import { COLORS } from '@trz/util/colors';
import { FaGithub } from 'react-icons/fa';
import { DEV_FakeAccountLogin } from './DEV_FakeAccountLogin';

const LoginPage = () => {
    return (
        <Center
            h="100vh"
            w="100vw"
            bg={COLORS.background.medium}
        >
            <Paper
                bg={COLORS.background.dark}
                radius="md"
                shadow="lg"
            >
                <Stack
                    px={'xl'}
                    py={'xl'}
                    ta="center"
                    c={COLORS.text.primary}
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
    );
};

export default LoginPage;
