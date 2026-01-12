import {
    Box,
    Burger,
    Button,
    Divider,
    Group,
    Kbd,
    Popover,
    ScrollAreaAutosize,
    Stack,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { LocalStorageKey } from '@mosaiq/terrazzo-common';
import TerrazzoLogo from '@trz/assets//terrazzo-logo.svg?react';
import { DirectoryListItemContextMenu } from '@trz/components/AppLayout/DirectorySidebar/DirectoryListItemContextMenu';
import { DirectoryTree } from '@trz/components/AppLayout/DirectorySidebar/DirectoryTree';
import { OrganizationSelectorMenu } from '@trz/components/AppLayout/DirectorySidebar/OrganizationSelectorMenu';
import { UserProfileIcon } from '@trz/components/AppLayout/Navbar/UserProfileIcon';
import { SearchBar } from '@trz/components/AutoComplete/Searchbar';
import { useOrg } from '@trz/contexts/org-context';
import { useUI } from '@trz/contexts/ui-context';
import { useUserContext } from '@trz/contexts/user-context';
import { COLORS } from '@trz/util/colors';
import { useContextMenu } from 'mantine-contextmenu';
import { NavLink, Outlet } from 'react-router-dom';

const AppLayout = () => {
    const uiCtx = useUI();
    const org = useOrg();
    const userCtx = useUserContext();
    const { showContextMenu } = useContextMenu();

    const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>({
        key: LocalStorageKey.SIDEBAR_COLLAPSED,
        defaultValue: false,
    });

    useHotkeys([
        [
            '[',
            () => {
                setSidebarCollapsed(!sidebarCollapsed);
            },
        ],
        ['/', () => {}],
    ]);

    const isPublicAccessMode = !userCtx.userId;

    return (
        <Group
            style={{
                minHeight: '100vh',
                minWidth: '100vw',
                overflow: 'hidden',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                gap: 0,
            }}
        >
            {!isPublicAccessMode && (
                <Stack
                    px={sidebarCollapsed ? '10px' : '15px'}
                    style={{
                        transition: `padding ${uiCtx.animationDuration}ms`,
                    }}
                    bg={COLORS.background.dark}
                    h="100vh"
                    pt={10}
                >
                    <Group
                        align="center"
                        justify={'space-between'}
                        wrap="nowrap"
                        gap={0}
                    >
                        <Tooltip
                            offset={{ mainAxis: 5 }}
                            label={
                                <Group align={'center'}>
                                    <Text size={'sm'}>Collapse Sidebar</Text>
                                    <Kbd>{'['}</Kbd>
                                </Group>
                            }
                        >
                            <Burger
                                transitionDuration={uiCtx.animationDuration}
                                opened={!sidebarCollapsed}
                                size="20px"
                                p="5px"
                                color="white"
                                onClick={() => {
                                    setSidebarCollapsed(!sidebarCollapsed);
                                }}
                            />
                        </Tooltip>
                        <NavLink
                            to={'/'}
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'flex-end',
                                textDecoration: 'none',
                                width: sidebarCollapsed ? '0px' : '200px',
                                transition: `width ${uiCtx.animationDuration}ms`,
                                overflow: 'hidden',
                            }}
                        >
                            <TerrazzoLogo
                                style={{
                                    fill: COLORS.foreground.dark,
                                    width: 16,
                                    height: 20,
                                }}
                            />
                            <Title
                                order={2}
                                c={COLORS.foreground.dark}
                                fw={700}
                                style={{
                                    letterSpacing: 1,
                                    textDecoration: 'none',
                                }}
                            >
                                errazzo
                            </Title>
                        </NavLink>
                    </Group>
                    <Divider />
                    <OrganizationSelectorMenu sidebarCollapsed={sidebarCollapsed} />
                    <Divider />
                    <Box
                        style={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            position: 'relative',
                        }}
                    >
                        <Box
                            style={{
                                position: 'relative',
                                zIndex: 1,
                            }}
                        >
                            <DirectoryTree
                                sidebarCollapsed={sidebarCollapsed}
                                orgId={org.active?.id}
                            />
                        </Box>
                        <Box
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 0,
                            }}
                            onContextMenuCapture={showContextMenu((close) =>
                                org.active ? (
                                    <DirectoryListItemContextMenu
                                        onClose={close}
                                        parentId={org.active.id}
                                        parentName={org.active.name}
                                        allowAddItem={true}
                                        isRoot
                                    />
                                ) : (
                                    <></>
                                )
                            )}
                        />
                    </Box>
                </Stack>
            )}
            <Stack
                flex={1}
                gap={0}
                style={{
                    overflow: 'hidden',
                }}
            >
                <Group
                    gap={0}
                    justify="space-between"
                    align="center"
                    bg={COLORS.background.dark}
                    h={uiCtx.navbarHeight}
                    px="md"
                >
                    <Group>
                        <Text
                            pl="lg"
                            c={COLORS.text.primary}
                        >
                            {uiCtx.pageTitle}
                        </Text>
                    </Group>
                    <Group>
                        <Popover
                            withArrow
                            arrowPosition="center"
                        >
                            <Popover.Target>
                                <Tooltip
                                    label="Notifications"
                                    openDelay={500}
                                    withArrow
                                >
                                    <Button
                                        variant="subtle"
                                        w="fit-content"
                                    >
                                        {/* <Indicator
                                            disabled={!userDash?.invites.length}
                                            label={userDash?.invites.length ?? undefined}
                                            size={16}
                                        >
                                            <MdNotificationsNone
                                                size={'1.25rem'}
                                                color="white"
                                            />
                                        </Indicator> */}
                                    </Button>
                                </Tooltip>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <ScrollAreaAutosize mah="60vh">
                                    <Stack w="30rem">
                                        {/* {userDash?.invites.map((i) => {
                                            return (
                                                <Notification
                                                    key={i.id}
                                                    withCloseButton={false}
                                                    title={
                                                        <Group>
                                                            <Avatar
                                                                src={i.entity.logoUrl ?? undefined}
                                                                name={i.entity.name}
                                                                color={'initials'}
                                                                display={'inline-block'}
                                                                size={'sm'}
                                                                mr={'5px'}
                                                            />
                                                            <Text>Invite to {i.entity.name}</Text>
                                                        </Group>
                                                    }
                                                >
                                                    <Text py="sm">
                                                        {fullName(i.fromUser)} ({i.fromUser.username}) has invited you to join {i.entity.name} as a {RoleNames[i.userRole]}
                                                    </Text>
                                                    <Group>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                try {
                                                                    replyInvite(sockCtx, i.id, false);
                                                                } catch (e) {
                                                                    notify(NoteType.GENERIC_ERROR, e);
                                                                }
                                                            }}
                                                        >
                                                            Decline
                                                        </Button>
                                                        <Button
                                                            variant="filled"
                                                            size="sm"
                                                            onClick={() => {
                                                                try {
                                                                    replyInvite(sockCtx, i.id, true);
                                                                    notify(NoteType.JOINED_ENTITY, [i.entity.name]);
                                                                    navigate('/org/' + i.entity.id);
                                                                } catch (e) {
                                                                    notify(NoteType.GENERIC_ERROR, e);
                                                                }
                                                            }}
                                                        >
                                                            Accept
                                                        </Button>
                                                    </Group>
                                                </Notification>
                                            );
                                        })} */}
                                        {/* {!userDash?.invites.length && (
                                            <Title
                                                ta="center"
                                                order={5}
                                            >
                                                No notifications to show!
                                            </Title>
                                        )} */}
                                    </Stack>
                                </ScrollAreaAutosize>
                            </Popover.Dropdown>
                        </Popover>
                        {!isPublicAccessMode && <SearchBar />}
                        <UserProfileIcon />
                    </Group>
                </Group>
                <Box style={{}}>
                    <Outlet />
                </Box>
            </Stack>
        </Group>
    );
};

export default AppLayout;
