import { Anchor, Box, Button, Center, Container, Divider, Flex, Group, Stack, Text, Title } from '@mantine/core';
import { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { UserProfileIcon } from '@trz/components/AppLayout/Navbar/UserProfileIcon';
import { useUserContext } from '@trz/contexts/user-context';
import { COLORS } from '@trz/util/colors';
import { setTitle } from '@trz/util/tabUtils';
import mosaiqLogo from '../assets/mosaiq-logo.png';
import TerrazzoLogo from '../assets/terrazzo-logo.svg?react';
import terrazzoScreenshot from '../assets/terrazzo-screenshot.png';
import './LandingPage.css';

const MAX_WIDTH = 700;

const LandingPage = () => {
    const { userId, goToLogin } = useUserContext();
    useEffect(() => {
        setTitle(`Terrazzo`);
    }, []);
    return (
        <Box
            bg={COLORS.background.medium}
            style={{ overflow: 'scroll', height: '100vh' }}
        >
            {/* Navbar */}
            <Box
                component="nav"
                bg={COLORS.background.medium}
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    borderBottom: `1px solid ${COLORS.divider}`,
                }}
            >
                <Container
                    size={MAX_WIDTH}
                    py="md"
                >
                    <Flex
                        justify="space-between"
                        align="center"
                    >
                        <NavLink
                            to={'/'}
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'flex-end',
                                textDecoration: 'none',
                                width: '200px',
                                overflow: 'hidden',
                            }}
                        >
                            <TerrazzoLogo
                                style={{
                                    fill: COLORS.text.primary,
                                    width: 16,
                                    height: 20,
                                }}
                            />
                            <Title
                                order={2}
                                c={COLORS.text.primary}
                                fw={700}
                                style={{
                                    letterSpacing: 1,
                                    textDecoration: 'none',
                                }}
                            >
                                errazzo
                            </Title>
                        </NavLink>
                        <Group gap="xs">
                            {userId ? (
                                <>
                                    <Anchor
                                        component={Link}
                                        to="/dashboard"
                                        c={'white'}
                                    >
                                        Dashboard
                                    </Anchor>
                                    <UserProfileIcon />
                                </>
                            ) : (
                                <Button
                                    color={COLORS.text.primary}
                                    c={COLORS.background.medium}
                                    variant="filled"
                                    radius="md"
                                    onClick={goToLogin}
                                >
                                    Login
                                </Button>
                            )}
                        </Group>
                    </Flex>
                </Container>
            </Box>

            <Divider
                size={1}
                color={COLORS.divider}
            />

            {/* Hero Section */}

            <Stack
                align="center"
                py={60}
            >
                <Stack
                    align="center"
                    gap="xs"
                    w="100%"
                    maw={MAX_WIDTH}
                >
                    <Title
                        order={1}
                        ta="center"
                        fw={900}
                        c={COLORS.text.primary}
                        style={{ fontSize: 40, lineHeight: 1.1 }}
                    >
                        Project management <br /> Without restrictions
                    </Title>
                    <Text
                        ta="center"
                        c={COLORS.text.secondary}
                        fz="lg"
                        mb="md"
                    >
                        Create stories, assign tasks, and ship features fast with your whole team.
                    </Text>
                    <Group
                        gap="sm"
                        mt="md"
                    >
                        {userId ? (
                            <Button
                                component={Link}
                                to="/dashboard"
                                color={COLORS.text.primary}
                                c={COLORS.background.medium}
                                size="md"
                                radius="md"
                                fw={600}
                            >
                                Go to Dashboard
                            </Button>
                        ) : (
                            <Button
                                color={COLORS.text.primary}
                                c={COLORS.background.medium}
                                size="md"
                                radius="md"
                                fw={600}
                                onClick={goToLogin}
                            >
                                Get Started
                            </Button>
                        )}
                    </Group>
                </Stack>
                <div id="features">
                    <div id="before">
                        <div className="feature">
                            <Text
                                c={COLORS.text.secondary}
                                fz="sm"
                            >
                                Easily sort tasks into columns
                            </Text>
                            <div className="connector"></div>
                            <div className="node"></div>
                        </div>
                        <div className="feature">
                            <Text
                                c={COLORS.text.secondary}
                                fz="sm"
                            >
                                Easily manage multiple workspaces
                            </Text>
                            <div className="connector"></div>
                            <div className="node"></div>
                        </div>
                    </div>
                    <img
                        src={terrazzoScreenshot}
                        alt="App screenshot"
                    />
                    <div id="after">
                        <div className="feature">
                            <div className="node"></div>
                            <div className="connector"></div>
                            <Text
                                c={COLORS.text.secondary}
                                fz="sm"
                            >
                                Track progress using size and status
                            </Text>
                        </div>
                        <div className="feature">
                            <div className="node"></div>
                            <div className="connector"></div>
                            <Text
                                c={COLORS.text.secondary}
                                fz="sm"
                            >
                                Add context with labels and descriptions
                            </Text>
                        </div>
                    </div>
                </div>
                <Stack
                    align="center"
                    gap="xs"
                    w="100%"
                    maw={MAX_WIDTH}
                >
                    <Stack
                        align="center"
                        gap={0}
                        mt={10}
                    >
                        <Text
                            c={COLORS.text.secondary}
                            fz="sm"
                        >
                            Proudly created and used by
                        </Text>
                        <Group
                            gap={5}
                            mt={4}
                        >
                            <img
                                src={mosaiqLogo}
                                alt="Mosaiq Software logo"
                                width={32}
                                height={32}
                            />
                            <Text
                                fw={700}
                                c={COLORS.text.primary}
                            >
                                Mosaiq Software
                            </Text>
                        </Group>
                        <Anchor
                            href="https://mosaiq.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            c={COLORS.text.primary}
                            underline="always"
                            fw={500}
                            style={{ fontSize: 15 }}
                        >
                            Learn more
                        </Anchor>
                    </Stack>
                </Stack>
            </Stack>

            <Divider
                size={1}
                color={COLORS.divider}
            />

            {/* Footer */}
            <Box
                bg={COLORS.background}
                py="md"
            >
                <Center>
                    <Text
                        c={COLORS.text.secondary}
                        fz="sm"
                    >
                        © Mosaiq Software, 2025
                    </Text>
                </Center>
            </Box>
        </Box>
    );
};

export default LandingPage;
