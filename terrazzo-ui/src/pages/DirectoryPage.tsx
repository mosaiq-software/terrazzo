import { ActionIcon, Box, Divider, Group, Loader, ScrollArea, Stack } from '@mantine/core';
import { useIdle } from '@mantine/hooks';
import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { Directory, DirectoryId, UserHeader } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { DirectoryContentsRows } from '@trz/components/Directory/DirectoryRows';
import EditableTextbox from '@trz/components/EditableTextbox';
import { NotFound, PageErrors } from '@trz/components/NotFound';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { useUser } from '@trz/contexts/user-context';
import { getDirectory, updateDirectoryMetadata } from '@trz/emitters/directoryEmitters';
import { useCatchSaveKey } from '@trz/hooks/useCatchSaveKey';
import { useRoom } from '@trz/hooks/useRoom';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import { setTitle } from '@trz/util/tabUtils';
import { IDLE_TIMEOUT_MS } from '@trz/util/textUtils';
import React, { useEffect, useState } from 'react';
import { MdChevronLeft } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

const DirectoryPage = (): React.JSX.Element => {
    const params = useParams();
    const sockCtx = useSocket();
    const trz = useTRZ();
    const navigate = useNavigate();
    const idle = useIdle(IDLE_TIMEOUT_MS);
    const usr = useUser();

    const dirId = params.directoryId as DirectoryId | undefined;

    const [directory, setDirectory] = useState<Directory | undefined | null>();
    const [lastEditor, setLastEditor] = useState<UserHeader | null>(null);

    useRoom(RoomType.DATA, dirId, false);
    useCatchSaveKey();

    useEffect(() => {
        const fetchDirectoryData = async () => {
            if (!dirId || !sockCtx.connected) {
                return;
            }

            try {
                const dir = await getDirectory(sockCtx, dirId);
                setDirectory(dir ?? null);
                setTitle(`${dir?.name ?? 'Directory'} | Terrazzo`);
            } catch (err) {
                notify(NoteType.DOC_DATA_ERROR, err);
                return;
            }
        };
        fetchDirectoryData();
    }, [dirId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_DIRECTORY,
        (payload) => {
            console.log('Received directory update:', payload, 'for directory:', directory);
            if (!directory || payload.id !== directory.id) {
                return;
            }
            setDirectory((prev) => {
                if (!prev) {
                    return prev;
                }
                return { ...updateBaseFromPartial(prev, payload) };
            });
        },
        [directory]
    );

    if (directory === undefined) {
        return <Loader />;
    }

    if (directory === null || !dirId) {
        return (
            <NotFound
                itemType="document"
                error={PageErrors.NOT_FOUND}
            />
        );
    }

    async function onTitleChange(value: string) {
        if (!directory) {
            notify(NoteType.DOC_UPDATE_ERROR);
            return;
        }
        try {
            updateDirectoryMetadata(sockCtx, directory.id, { name: value });
        } catch (e) {
            notify(NoteType.CARD_UPDATE_ERROR, e);
            return;
        }
    }

    return (
        <ScrollArea h={`calc(100vh - ${trz.navbarHeight}px)`}>
            <Stack
                bg="#15161A"
                mih="100vh"
                pb="10vh"
                align="center"
            >
                <Box
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Stack
                        style={{
                            maxWidth: '60rem',
                            paddingTop: '2rem',
                            minWidth: '90%',
                        }}
                    >
                        <Group
                            wrap="nowrap"
                            align="center"
                        >
                            <ActionIcon
                                variant="subtle"
                                onClick={() => {
                                    if (directory.parentId) {
                                        navigate(`/dir/${directory.parentId}`);
                                    } else {
                                        navigate(`/dashboard`);
                                    }
                                }}
                            >
                                <MdChevronLeft size="1.5rem" />
                            </ActionIcon>
                            <EditableTextbox
                                value={directory.name}
                                onChange={onTitleChange}
                                type="title"
                                placeholder="Directory Name"
                                titleProps={{
                                    order: 2,
                                    textWrap: 'nowrap',
                                    fw: 600,
                                    c: 'white',
                                }}
                                inputProps={{
                                    w: '100%',
                                    bg: 'transparent',
                                }}
                                style={{
                                    width: '95%',
                                }}
                            />{' '}
                        </Group>
                        <Divider c="dimmed" />
                        <DirectoryContentsRows
                            modules={directory.modules}
                            parentId={directory.id}
                            allowAddItem
                        />
                    </Stack>
                </Box>
            </Stack>
        </ScrollArea>
    );
};

export default DirectoryPage;
