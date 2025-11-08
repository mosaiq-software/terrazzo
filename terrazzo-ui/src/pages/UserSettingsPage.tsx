import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '@trz/contexts/socket-context';
import { BoardHeader, BoardId, CardId, Label, LabelId, ListId, UID } from '@mosaiq/terrazzo-common/types';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { ActionIcon, Anchor, Badge, Box, Button, ColorInput, Divider, Fieldset, Group, Pill, ScrollArea, Select, Space, Stack, Text, Textarea, TextInput, Title, Tooltip } from '@mantine/core';
import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { useRoom } from '@trz/hooks/useRoom';
import { createBoardLabel, deleteBoardLabel, getBoardData, updateBoardField, updateBoardLabel } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { DEFAULT_AUTHED_ROUTE, useUser } from '@trz/contexts/user-context';
import { NotFound, PageErrors } from '@trz/components/NotFound';
import { MdOutlineAdd, MdOutlineCheck, MdOutlineChevronLeft, MdOutlineClose, MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';
import { TEMPORARY_ID } from '@mosaiq/terrazzo-common/constants';
import { colorIsDarkAdvanced, generateRandomColor } from '@trz/util/colorUtils';
import { RingHoldingButton } from '@trz/components/RingHoldingButton';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { useDashboard } from '@trz/contexts/dashboard-context';
import { setTitle } from '@trz/util/tabUtils';

const UserSettingsPage = (): React.JSX.Element => {
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const sockCtx = useSocket();
    const trz = useTRZ();
    const userCtx = useUser();
    const { userDash, updateUserDash } = useDashboard();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle(`My Settings | Terrazzo`);
    }, []);

    const archivedOrgs = useMemo(() => userDash?.organizations.filter((e) => e.archived) ?? [], [userDash?.organizations]);

    if (!userCtx.userData) {
        return (
            <NotFound
                itemType="user"
                error={PageErrors.FORBIDDEN}
            />
        );
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
                            width: '40rem',
                            paddingTop: '2rem',
                        }}
                    >
                        <Group>
                            <Title order={2}>Settings for {fullName(userCtx.userData)}</Title>
                        </Group>
                        <Fieldset
                            legend="General"
                            bg="transparent"
                        >
                            <Stack>
                                {/* User settings */}
                                {/* <TextInput
                                    labelProps={{
                                        c: 'white',
                                    }}
                                    label="Board Name"
                                    placeholder="My Board"
                                    required
                                    value={boardData.name ?? ''}
                                    onChange={(e) => {
                                        setBoardData({ ...boardData, name: e.target.value });
                                        setIsDirty(true);
                                    }}
                                />
                                <TextInput
                                    w="8rem"
                                    labelProps={{
                                        c: 'white',
                                    }}
                                    label="Board Code"
                                    placeholder=""
                                    value={boardData.boardCode ?? ''}
                                    onChange={(e) => {
                                        setBoardData({ ...boardData, boardCode: e.target.value });
                                        setIsDirty(true);
                                    }}
                                />
                                <Button
                                    disabled={!isDirty}
                                    variant="filled"
                                    onClick={async () => {
                                        try {
                                            updateBoardField(sockCtx, boardId, boardData);
                                            notify(NoteType.CHANGES_SAVED);
                                            setIsDirty(false);
                                        } catch (e) {
                                            notify(NoteType.BOARD_DATA_ERROR, e);
                                        }
                                    }}
                                >
                                    Save
                                </Button> */}
                            </Stack>
                        </Fieldset>
                        <Fieldset
                            legend="Archive"
                            bg="transparent"
                        >
                            {archivedOrgs.length === 0 ? (
                                <Text>Nothing archived yet!</Text>
                            ) : (
                                <Stack>
                                    {archivedOrgs.map((org) => (
                                        <Anchor
                                            key={org.id}
                                            href={`/org/${org.id}`}
                                        >
                                            {org.name}
                                        </Anchor>
                                    ))}
                                </Stack>
                            )}
                        </Fieldset>
                        {/* <Divider /> */}
                        <Space />
                        {/* <Text>Joined {new Date(userCtx.userData.joinedAt).toLocaleString()}</Text> */}
                        {/* <Text>Board contains {boardData.totalCards} cards</Text> */}
                        {/* <Divider /> */}
                        <Space />
                        <Group gap="sm">
                            {/* Account deletion one day... */}
                            {/* <Button
                                variant="light"
                                color="red"
                                w="min-content"
                                onClick={() => {
                                    try {
                                        updateBoardField(sockCtx, boardId, { archived: true });
                                        notify(NoteType.CHANGES_SAVED);
                                        navigate(`/project/${boardData.projectId}`);
                                    } catch (e) {
                                        notify(NoteType.BOARD_DATA_ERROR, e);
                                    }
                                }}
                            >
                                Archive Board
                            </Button> */}
                        </Group>
                    </Stack>
                </Box>
            </Stack>
        </ScrollArea>
    );
};

export default UserSettingsPage;
