import { Anchor, Box, Fieldset, Group, ScrollArea, Space, Stack, Text, Title } from '@mantine/core';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { NotFound, PageErrors } from '@trz/components/NotFound';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { useUser } from '@trz/contexts/user-context';
import { setTitle } from '@trz/util/tabUtils';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserSettingsPage = (): React.JSX.Element => {
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const sockCtx = useSocket();
    const trz = useTRZ();
    const userCtx = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle(`My Settings | Terrazzo`);
    }, []);

    const archivedOrgs = useMemo(() => trz?.allOrganizations.filter((e) => e.archived) ?? [], [trz?.allOrganizations]);

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
