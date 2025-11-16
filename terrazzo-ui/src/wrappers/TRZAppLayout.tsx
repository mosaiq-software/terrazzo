import { Avatar, Box, Burger, Button, Divider, Group, Kbd, Menu, Popover, ScrollAreaAutosize, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { LocalStorageKey } from '@mosaiq/terrazzo-common/constants';
import { ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { SearchBar } from '@trz/components/AutoComplete/Searchbar';
import { UserProfileIcon } from '@trz/components/UserProfileIcon';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { replyInvite } from '@trz/emitters';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import { MdOutlineSettings } from 'react-icons/md';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import TerrazzoLogo from '../assets/terrazzo-logo.svg?react';

const ANIM_DURATION = 500;
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
                    transition: `padding ${ANIM_DURATION}ms`,
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
                            transitionDuration={ANIM_DURATION}
                            opened={!sidebarCollapsed}
                            size="20px"
                            p="5Spx"
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
                            transition: `width ${ANIM_DURATION}ms`,
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
                <Menu
                    position={sidebarCollapsed ? 'right-start' : 'bottom-start'}
                    width={200}
                    withinPortal
                    trigger="hover"
                >
                    <Menu.Target>
                        <Tooltip
                            disabled={!sidebarCollapsed}
                            label={trz.selectedOrganization?.name}
                            withArrow
                            arrowPosition="side"
                            position="right"
                            openDelay={700}
                            closeDelay={200}
                        >
                            <Button
                                display={'flex'}
                                variant={'subtle'}
                                px={0}
                                onClick={() => {
                                    if (!trz.selectedOrganization) return;
                                    navigate(`/org/${trz.selectedOrganization.id}`);
                                }}
                            >
                                {trz.selectedOrganization && (
                                    <Avatar
                                        src={trz.selectedOrganization.logoUrl ?? undefined}
                                        name={trz.selectedOrganization.name}
                                        color={'initials'}
                                        display={'inline-block'}
                                        size={'sm'}
                                    />
                                )}
                                <Text
                                    c="#fff"
                                    style={{
                                        transition: `padding ${ANIM_DURATION}ms, width ${ANIM_DURATION}ms`,
                                        textWrap: 'nowrap',
                                        textAlign: 'left',
                                        width: sidebarCollapsed ? '0px' : '220px',
                                        paddingLeft: sidebarCollapsed ? '0px' : '5px',
                                    }}
                                >
                                    {trz.selectedOrganization?.name ?? 'Select Organization'}
                                </Text>
                            </Button>
                        </Tooltip>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Organizations</Menu.Label>
                        {trz.allOrganizations.map((org) => (
                            <Menu.Item
                                key={org.id}
                                onClick={() => {
                                    navigate(`/org/${org.id}`);
                                }}
                            >
                                <Group
                                    wrap="nowrap"
                                    gap={8}
                                    px={0}
                                    onClick={() => {
                                        trz.setSelectedOrganization(org);
                                        navigate(`/org/${org.id}`);
                                    }}
                                >
                                    <Avatar
                                        src={org.logoUrl ?? undefined}
                                        name={org.name}
                                        color={'initials'}
                                        display={'inline-block'}
                                        size={'sm'}
                                    />
                                    <Text
                                        c="#fff"
                                        style={{
                                            textWrap: 'nowrap',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {org.name}
                                    </Text>
                                </Group>
                            </Menu.Item>
                        ))}
                        <Menu.Item
                            onClick={() => {
                                modals.openContextModal({
                                    modal: 'organization',
                                    title: 'Create New Organization',
                                    innerProps: {},
                                });
                            }}
                        >
                            Create Organization
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
                <Divider />
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
                        {trz.boardData && (
                            <Text
                                pl="lg"
                                c="#fff"
                                onClick={() => {
                                    navigate(`/board/${trz.boardData?.id}`);
                                }}
                                style={{
                                    cursor: 'pointer',
                                }}
                            >
                                {trz.boardData?.boardCode ? `[${trz.boardData?.boardCode}] ` : ''}
                                {trz.boardData?.name}
                            </Text>
                        )}
                        {boardId && (
                            <Tooltip
                                label="Board Settings"
                                openDelay={500}
                                withArrow
                            >
                                <Button
                                    variant="subtle"
                                    w="fit-content"
                                    onClick={() => {
                                        if (location.pathname.endsWith('/settings')) {
                                            navigate(`/board/${boardId}`);
                                        } else {
                                            navigate(`/board/${boardId}/settings`);
                                        }
                                    }}
                                >
                                    <MdOutlineSettings
                                        size={'1.25rem'}
                                        color="white"
                                    />
                                </Button>
                            </Tooltip>
                        )}
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

// {userDash?.organizations
//                     .filter((e) => !e.archived)
//                     .map((org) => {
//                         return (
//                             <Box
//                                 key={org.id}
//                                 style={{
//                                     width: 'min-content',
//                                 }}
//                             >
//                                 <Group
//                                     align="center"
//                                     justify="flex-start"
//                                     pt="0"
//                                     w="100%"
//                                 >
//                                     <Tooltip
//                                         disabled={!sidebarCollapsed}
//                                         label={org.name}
//                                         withArrow
//                                         arrowPosition="side"
//                                         position="right"
//                                         openDelay={700}
//                                         closeDelay={200}
//                                     >
//                                         <Button
//                                             display={'flex'}
//                                             variant={location.pathname === `/org/${org.id}` ? 'light' : 'subtle'}
//                                             px={0}
//                                             onClick={() => {
//                                                 navigate(`/org/${org.id}`);
//                                             }}
//                                         >
//                                             <Avatar
//                                                 src={org.logoUrl ?? undefined}
//                                                 name={org.name}
//                                                 color={'initials'}
//                                                 display={'inline-block'}
//                                                 size={'sm'}
//                                             />
//                                             <Text
//                                                 c="#fff"
//                                                 style={{
//                                                     transition: `padding ${ANIM_DURATION}ms, width ${ANIM_DURATION}ms`,
//                                                     textWrap: 'nowrap',
//                                                     textAlign: 'left',
//                                                     width: sidebarCollapsed ? '0px' : '220px',
//                                                     paddingLeft: sidebarCollapsed ? '0px' : '5px',
//                                                 }}
//                                             >
//                                                 {org.name}
//                                             </Text>
//                                         </Button>
//                                     </Tooltip>
//                                 </Group>
//                                 {/* <Stack gap={0}>
//                                     {org.projects
//                                         .filter((e) => !e.archived)
//                                         .map((project) => {
//                                             return (
//                                                 <Group
//                                                     key={project.id}
//                                                     align="center"
//                                                     justify="flex-start"
//                                                     p="0"
//                                                     ml="sm"
//                                                     style={{
//                                                         overflow: 'hidden',
//                                                         width: sidebarCollapsed ? '0px' : '100%',
//                                                         height: sidebarCollapsed ? '0px' : '36px',
//                                                         transition: `height ${ANIM_DURATION}ms, width ${ANIM_DURATION}ms, padding ${ANIM_DURATION}ms`,
//                                                     }}
//                                                 >
//                                                     <Button
//                                                         display={'flex'}
//                                                         px={0}
//                                                         variant={location.pathname === `/project/${project.id}` ? 'light' : 'subtle'}
//                                                         onClick={() => {
//                                                             navigate(`/project/${project.id}`);
//                                                         }}
//                                                     >
//                                                         <Avatar
//                                                             src={project.logoUrl ?? undefined}
//                                                             name={project.name}
//                                                             color={'initials'}
//                                                             display={'inline-block'}
//                                                             size={'sm'}
//                                                         />
//                                                         <Text
//                                                             c="#fff"
//                                                             style={{
//                                                                 transition: `padding ${ANIM_DURATION}ms, width ${ANIM_DURATION}ms`,
//                                                                 textWrap: 'nowrap',
//                                                                 textAlign: 'left',
//                                                                 width: sidebarCollapsed ? '0px' : '200px',
//                                                                 paddingLeft: sidebarCollapsed ? '0px' : '5px',
//                                                             }}
//                                                         >
//                                                             {project.name}
//                                                         </Text>
//                                                     </Button>
//                                                 </Group>
//                                             );
//                                         })}
//                                 </Stack> */}
//                             </Box>
//                         );
//                     })}
