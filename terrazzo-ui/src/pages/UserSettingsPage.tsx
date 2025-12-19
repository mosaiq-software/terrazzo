import { Box, Fieldset, Group, ScrollArea, Space, Stack, Title } from '@mantine/core';
import { fullName } from '@mosaiq/terrazzo-common';
import { NotFound, PageErrors } from '@trz/components/UI/NotFound';
import { useUI } from '@trz/contexts/ui-context';
import { useMe } from '@trz/hooks/useMe';
import { setTitle } from '@trz/util/tabUtils';
import React, { useEffect } from 'react';

const UserSettingsPage = (): React.JSX.Element => {
    const uiCtx = useUI();
    const me = useMe();

    useEffect(() => {
        setTitle(`My Settings | Terrazzo`);
    }, []);

    if (!me) {
        return (
            <NotFound
                itemType="user"
                error={PageErrors.FORBIDDEN}
            />
        );
    }

    return (
        <ScrollArea h={`calc(100vh - ${uiCtx.navbarHeight}px)`}>
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
                            <Title order={2}>Settings for {fullName(me)}</Title>
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
