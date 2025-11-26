import { Box, Burger, Button, Divider, Group, Kbd, Popover, ScrollAreaAutosize, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { LocalStorageKey } from '@mosaiq/terrazzo-common/constants';
import { ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { DirectoryListItemContextMenu } from '@trz/components/AppLayout/DirectoryListItemContextMenu';
import { DirectoryTree } from '@trz/components/AppLayout/DirectoryTree';
import { OrganizationSelectorMenu } from '@trz/components/AppLayout/OrganizationSelectorMenu';
import { SearchBar } from '@trz/components/AutoComplete/Searchbar';
import { UserProfileIcon } from '@trz/components/UserProfileIcon';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { replyInvite } from '@trz/emitters';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import { useContextMenu } from 'mantine-contextmenu';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import TerrazzoLogo from '../assets/terrazzo-logo.svg?react';

interface TRZAppLayoutProps {
    children: any;
}
const TRZAppLayout = (props: TRZAppLayoutProps) => {
    const trz = useTRZ();
    const sockCtx = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const boardId = params.boardId;
    const { showContextMenu } = useContextMenu();

    const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>({ key: LocalStorageKey.SIDEBAR_COLLAPSED, defaultValue: false });

    useHotkeys([
        [
            '[',
            () => {
                setSidebarCollapsed(!sidebarCollapsed);
            },
        ],
        ['/', () => {}],
    ]);

    useSocketListener<ServerSE.RECEIVE_INVITE>(ServerSE.RECEIVE_INVITE, (payload) => {
        notify(NoteType.INVITE_RECEIVED, [fullName(payload.fromUser), payload.entity.name], {
            primary: async () => {
                try {
                    replyInvite(sockCtx, payload.id, true);
                } catch (e) {
                    notify(NoteType.GENERIC_ERROR, e);
                }
            },
            secondary: () => {
                try {
                    replyInvite(sockCtx, payload.id, false);
                } catch (e) {
                    notify(NoteType.GENERIC_ERROR, e);
                }
            },
        });
    });

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
            <Stack
                px={sidebarCollapsed ? '10px' : '15px'}
                style={{
                    transition: `padding ${trz.animationDuration}ms`,
                }}
                bg="#0c0c10"
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
                            transitionDuration={trz.animationDuration}
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
                            transition: `width ${trz.animationDuration}ms`,
                            overflow: 'hidden',
                        }}
                    >
                        <TerrazzoLogo
                            style={{
                                fill: '#282836',
                                width: 16,
                                height: 20,
                            }}
                        />
                        <Title
                            order={2}
                            c="#282836"
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
                        {trz.userDirectoryStructure && (
                            <DirectoryTree
                                sidebarCollapsed={sidebarCollapsed}
                                directoryTreeRoot={trz.userDirectoryStructure}
                            />
                        )}
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
                            trz.selectedOrganization ? (
                                <DirectoryListItemContextMenu
                                    onClose={close}
                                    parentId={trz.selectedOrganization.id}
                                    parentName={trz.selectedOrganization.name}
                                    allowAddItem={true}
                                />
                            ) : (
                                <></>
                            )
                        )}
                    />
                </Box>
            </Stack>
            <Stack
                flex={1}
                gap={0}
                style={{
                    overflow: 'hidden',
                }}
            >
                <Group
                    style={{
                        justifyContent: 'space-between',
                        height: `${trz.navbarHeight}px`,
                        padding: '10px',
                        background: '#0c0c10',
                        gap: 0,
                    }}
                >
                    <Group>
                        <Text
                            pl="lg"
                            c="#fff"
                        >
                            {trz.pageTitle}
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
                        <SearchBar />
                        <UserProfileIcon />
                    </Group>
                </Group>
                <Box style={{}}>{props.children}</Box>
            </Stack>
        </Group>
    );
};

export default TRZAppLayout;
