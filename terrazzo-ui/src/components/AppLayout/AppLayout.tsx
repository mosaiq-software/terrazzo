import { Box, Divider, Group, Stack, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { TrzModule, UID } from '@mosaiq/terrazzo-common';
import TerrazzoLogo from '@trz/assets//terrazzo-logo.svg?react';
import { DirectoryListItemContextMenu } from '@trz/components/AppLayout/DirectorySidebar/DirectoryListItemContextMenu';
import { DirectoryTree } from '@trz/components/AppLayout/DirectorySidebar/DirectoryTree';
import { OrganizationSelectorMenu } from '@trz/components/AppLayout/DirectorySidebar/OrganizationSelectorMenu';
import { UserProfileIcon } from '@trz/components/AppLayout/Navbar/UserProfileIcon';
import { SearchBar } from '@trz/components/AutoComplete/Searchbar';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { useUI } from '@trz/contexts/ui-context';
import { useUserContext } from '@trz/contexts/user-context';
import { createModule } from '@trz/emitters';
import { COLORS } from '@trz/util/colors';
import { NoteType, notify } from '@trz/util/notifications';
import { useContextMenu } from 'mantine-contextmenu';
import { useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AppLayout = () => {
    const uiCtx = useUI();
    const org = useOrg();
    const sockCtx = useSocket();
    const userCtx = useUserContext();
    const { showContextMenu } = useContextMenu();
    const isPublicAccessMode = !userCtx.userId;

    const addItem = useCallback(
        async (toParentId: UID, type: TrzModule) => {
            if (!toParentId || !type || !userCtx.userId) {
                return;
            }
            try {
                switch (type) {
                    case TrzModule.Directory:
                        await createModule(sockCtx, 'New Directory', toParentId, {
                            type: TrzModule.Directory,
                            initialData: {},
                        });
                        return;
                    case TrzModule.Document:
                        await createModule(sockCtx, 'New Document', toParentId, {
                            type: TrzModule.Document,
                            initialData: {
                                createdByUserId: userCtx.userId,
                            },
                        });
                        return;
                    case TrzModule.Board:
                        modals.openContextModal({
                            modal: 'board',
                            title: 'Create New Board',
                            innerProps: { parentId: toParentId },
                        });
                        return;
                    default:
                        notify(NoteType.CARD_UPDATE_ERROR, 'Unknown module type: ' + type);
                        return;
                }
            } catch (e) {
                notify(NoteType.CARD_UPDATE_ERROR, e);
                return;
            }
        },
        [sockCtx, userCtx.userId]
    );

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
                    w={260}
                    px="0.5rem"
                    bg={COLORS.background.dark}
                    h="100vh"
                    pt={10}
                >
                    <Group
                        align="center"
                        wrap="nowrap"
                        gap={0}
                    >
                        <NavLink
                            to={'/'}
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'flex-end',
                                textDecoration: 'none',
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
                    <OrganizationSelectorMenu />
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
                                orgId={org.active?.id}
                                addItem={addItem}
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
                                        addItem={addItem}
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
