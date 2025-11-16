import { Avatar, Box, Button, Center, Divider, Flex, Group, HoverCard, Kbd, Loader, ScrollArea, Stack, Text, Title, Tooltip, UnstyledButton } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { useUser } from '@trz/contexts/user-context';
import { setTitle } from '@trz/util/tabUtils';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = (): React.JSX.Element => {
    const usr = useUser();
    const trz = useTRZ();
    const navigate = useNavigate();
    const clipboard = useClipboard();

    useEffect(() => {
        setTitle(`Dashboard | Terrazzo`);
    }, []);

    const orgs = useMemo(() => trz?.allOrganizations.filter((e) => !e.archived), [trz?.allOrganizations]);

    return (
        <ScrollArea
            bg="#15161A"
            h={`calc(100vh - ${trz.navbarHeight}px)`}
        >
            <Center h="100%">
                <Stack
                    w="90%"
                    py="2rem"
                    maw="1200px"
                >
                    <Flex
                        direction="row"
                        justify="space-between"
                        py="25"
                    >
                        <Title
                            c="white"
                            order={2}
                        >
                            Welcome {usr.userData?.firstName ?? ''}
                        </Title>
                        <Group gap="md">
                            <Button
                                variant="subtle"
                                onClick={() => {
                                    modals.openContextModal({
                                        modal: 'organization',
                                        title: 'Create New Organization',
                                        innerProps: {},
                                    });
                                }}
                                mx="4"
                                px="8"
                            >
                                Create Organization
                            </Button>
                            <HoverCard
                                width={280}
                                shadow="md"
                                arrowPosition="center"
                                withArrow
                            >
                                <HoverCard.Target>
                                    <Button
                                        variant="outline"
                                        mx="4"
                                        px="8"
                                    >
                                        Join Organization
                                    </Button>
                                </HoverCard.Target>
                                <HoverCard.Dropdown>
                                    <Text fz={'sm'}>
                                        Send your username
                                        <Tooltip label={'Copy'}>
                                            <Button
                                                variant="subtle"
                                                onClick={() => {
                                                    clipboard.copy(usr.userData?.username ?? '');
                                                }}
                                                mx="2"
                                                px="4"
                                                size={'xs'}
                                            >
                                                <Kbd fz="xs">{clipboard.copied ? 'Copied!' : usr.userData?.username}</Kbd>
                                            </Button>
                                        </Tooltip>
                                        to someone to get invited!
                                    </Text>
                                </HoverCard.Dropdown>
                            </HoverCard>
                        </Group>
                    </Flex>
                    <Divider
                        color="#5B5857"
                        mb="15"
                    />
                    <Box
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <Title
                            c="white"
                            order={4}
                            my="xs"
                        >
                            Organizations
                        </Title>
                        {orgs &&
                            orgs.map((org) => {
                                return (
                                    <Stack
                                        key={org.id}
                                        w="100%"
                                    >
                                        <UnstyledButton
                                            variant="subtle"
                                            c="white"
                                            onClick={() => navigate('/org/' + org.id)}
                                            w={'100%'}
                                        >
                                            <Group justify="space-between">
                                                <Group>
                                                    <Avatar
                                                        src={org.logoUrl ?? undefined}
                                                        name={org.name}
                                                        color={'initials'}
                                                        size={'50'}
                                                        radius={'lg'}
                                                    />
                                                    <Title
                                                        order={3}
                                                        c="#fff"
                                                        td="none"
                                                    >
                                                        {org.name}
                                                    </Title>
                                                </Group>
                                                {/* <AvatarRow
                                                    users={org.members.map((m) => m.user)}
                                                    maxUsers={10}
                                                /> */}
                                            </Group>
                                        </UnstyledButton>
                                    </Stack>
                                );
                            })}
                        {orgs?.length == 0 && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    modals.openContextModal({
                                        modal: 'organization',
                                        title: 'Create New Organization',
                                        innerProps: {},
                                    });
                                }}
                                mx="4"
                                px="8"
                            >
                                Create your own Organization
                            </Button>
                        )}
                        {!trz && (
                            <Center
                                w="100%"
                                h="100%"
                            >
                                <Loader type="bars" />
                            </Center>
                        )}
                    </Box>
                </Stack>
            </Center>
        </ScrollArea>
    );
};

export default HomePage;
