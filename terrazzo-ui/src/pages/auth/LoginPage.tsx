import { Button, Center, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { getGithubLoginUrl } from '@trz/util/authUtils';
import { COLORS } from '@trz/util/colors';
import { FaGithub } from 'react-icons/fa';
import { DEV_FakeAccountLogin } from './DEV_FakeAccountLogin';

const LoginPage = () => {
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
