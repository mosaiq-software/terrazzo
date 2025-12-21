import { Avatar, Box, Button, Center, Divider, Flex, Group, ScrollArea, Stack, Title, UnstyledButton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useOrg } from '@trz/contexts/org-context';
import { useUI } from '@trz/contexts/ui-context';
import { useMe } from '@trz/hooks/useMe';
import { setTitle } from '@trz/util/tabUtils';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = (): React.JSX.Element => {
    const me = useMe();
    const uiCtx = useUI();
    const orgCtx = useOrg();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle(`Dashboard | Terrazzo`);
    }, []);

    return (
        <ScrollArea
            bg="#15161A"
            h={`calc(100vh - ${uiCtx.navbarHeight}px)`}
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
                            Welcome {me?.firstName ?? ''}
                        </Title>
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
                        {orgCtx.allOrganizations.map((org) => {
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
                        {orgCtx.allOrganizations.length == 0 && (
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
                    </Box>
                </Stack>
            </Center>
        </ScrollArea>
    );
};

export default HomePage;
