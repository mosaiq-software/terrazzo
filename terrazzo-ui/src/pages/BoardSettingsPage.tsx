import { ActionIcon, Alert, Box, Button, ColorInput, Divider, Fieldset, Group, ScrollArea, Space, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { TEMPORARY_ID } from '@mosaiq/terrazzo-common/constants';
import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { BoardHeader, BoardId, Label } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { NotFound, PageErrors } from '@trz/components/NotFound';
import { RingHoldingButton } from '@trz/components/RingHoldingButton';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { createBoardLabel, deleteBoardLabel, getBoardData, updateBoardField, updateBoardLabel } from '@trz/emitters';
import { useRoom } from '@trz/hooks/useRoom';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { colorIsDarkAdvanced, generateRandomColor } from '@trz/util/colorUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { setTitle } from '@trz/util/tabUtils';
import React, { useEffect, useState } from 'react';
import { MdOutlineAdd, MdOutlineCheck, MdOutlineChevronLeft, MdOutlineClose, MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

const BoardSettingsPage = (): React.JSX.Element => {
    const [boardData, setBoardData] = useState<BoardHeader | undefined>(undefined);
    const [boardLabels, setBoardLabels] = useState<Label[]>([]);
    const [editingLabel, setEditingLabel] = useState<Label | undefined>(undefined);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const params = useParams();
    const boardId = params.boardId as BoardId;
    const sockCtx = useSocket();
    const trz = useTRZ();
    const navigate = useNavigate();
    useRoom(RoomType.DATA, boardId, false);

    useEffect(() => {
        const fetchBoardData = async () => {
            if (!boardId || !sockCtx.connected) {
                return;
            }
            try {
                const boardRes = await getBoardData(sockCtx, boardId);
                setBoardLabels(boardRes?.labels ?? []);
                setBoardData(boardRes);
                trz.setBoardData(boardRes);
                setTitle(`${boardRes?.name ?? 'Board'} Settings | Terrazzo`);
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
                return;
            }
        };
        fetchBoardData();
        return () => {
            trz.setBoardData(undefined);
        };
    }, [boardId, sockCtx.connected]);

    useSocketListener<ServerSE.UPDATE_BOARD_FIELD>(ServerSE.UPDATE_BOARD_FIELD, (payload) => {
        if (boardId !== payload.id) {
            return;
        }
        setBoardData((prev) => {
            if (!prev) {
                return prev;
            }
            return updateBaseFromPartial(prev, payload);
        });
    });

    useSocketListener<ServerSE.UPDATE_BOARD_LABELS>(ServerSE.UPDATE_BOARD_LABELS, (payload) => {
        if (boardId !== payload.boardId) {
            return;
        }
        setBoardLabels(payload.labels);
    });

    const isValidLabel = (l?: Label) => {
        return l && l.name.trim().length > 0 && l.color.length === 7;
    };

    const onSaveLabel = () => {
        setEditingLabel(undefined);
        if (!editingLabel || !isValidLabel(editingLabel)) {
            return;
        }
        if (editingLabel.id === TEMPORARY_ID) {
            createBoardLabel(sockCtx, boardId, editingLabel.name, editingLabel.color);
            onCreateNewLabel();
        } else {
            updateBoardLabel(sockCtx, boardId, editingLabel);
        }
    };

    const onCreateNewLabel = () => {
        const newLabel: Label = {
            id: TEMPORARY_ID,
            name: '',
            color: generateRandomColor(),
        };
        setEditingLabel(newLabel);
    };

    if (!boardId || !boardData) {
        return (
            <NotFound
                itemType="board"
                error={PageErrors.NOT_FOUND}
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
                        {boardData.archived && (
                            <Alert
                                title="Archived Board"
                                color="yellow"
                            >
                                <Stack>
                                    <Text>This board is archived and can only be viewed.</Text>
                                    <Button
                                        variant="subtle"
                                        onClick={() => {
                                            updateBoardField(sockCtx, boardId, { archived: false });
                                            notify(NoteType.CHANGES_SAVED);
                                        }}
                                    >
                                        Unarchive Board
                                    </Button>
                                </Stack>
                            </Alert>
                        )}
                        <Group>
                            <ActionIcon
                                onClick={() => navigate(`/board/${boardId}`)}
                                variant="subtle"
                                size="md"
                            >
                                <MdOutlineChevronLeft size="24" />
                            </ActionIcon>
                            <Title order={2}>Settings for {boardData.name}</Title>
                        </Group>
                        <Fieldset
                            legend="Board"
                            bg="transparent"
                        >
                            <Stack>
                                <TextInput
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
                                </Button>
                            </Stack>
                        </Fieldset>
                        <Fieldset
                            legend="Labels"
                            bg="transparent"
                        >
                            <Stack>
                                <Group
                                    justify="flex-start"
                                    wrap="wrap"
                                >
                                    {boardLabels.map((label) => {
                                        const textColor = colorIsDarkAdvanced(label.color) ? '#ffffff' : '#000000';
                                        return (
                                            <Group
                                                key={label.id}
                                                bg={label.color}
                                                w="fit-content"
                                                wrap="nowrap"
                                                justify="flex-start"
                                                px="sm"
                                                gap="0"
                                                style={{
                                                    borderRadius: '10px',
                                                }}
                                            >
                                                <Text
                                                    c={textColor}
                                                    size="sm"
                                                >
                                                    {label.name}
                                                </Text>
                                                <ActionIcon
                                                    size="input-xs"
                                                    radius={'100%'}
                                                    bg={'transparent'}
                                                    onClick={() => {
                                                        setEditingLabel(label);
                                                    }}
                                                >
                                                    <MdOutlineEdit color={textColor} />
                                                </ActionIcon>
                                            </Group>
                                        );
                                    })}
                                </Group>
                                {editingLabel && (
                                    <Group>
                                        <TextInput
                                            value={editingLabel.name}
                                            onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                                            placeholder="New Label..."
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === 'Return') {
                                                    onSaveLabel();
                                                }
                                            }}
                                        />
                                        <ColorInput
                                            value={editingLabel.color}
                                            onChange={(e) => setEditingLabel({ ...editingLabel, color: e })}
                                        />
                                        <Tooltip
                                            label="Save"
                                            openDelay={200}
                                        >
                                            <ActionIcon
                                                size="input-sm"
                                                onClick={onSaveLabel}
                                                disabled={!isValidLabel(editingLabel)}
                                            >
                                                {editingLabel.id === TEMPORARY_ID && <MdOutlineAdd />}
                                                {editingLabel.id !== TEMPORARY_ID && <MdOutlineCheck />}
                                            </ActionIcon>
                                        </Tooltip>
                                        {editingLabel.id !== TEMPORARY_ID && (
                                            <RingHoldingButton
                                                durationMs={1000}
                                                ringSize={50}
                                                ringThickness={6}
                                                color="red"
                                                onClick={async () => {
                                                    setEditingLabel(undefined);
                                                    deleteBoardLabel(sockCtx, boardId, editingLabel.id);
                                                }}
                                            >
                                                <MdOutlineDelete />
                                            </RingHoldingButton>
                                        )}
                                        {editingLabel.id === TEMPORARY_ID && (
                                            <Tooltip
                                                label="Cancel"
                                                openDelay={200}
                                            >
                                                <ActionIcon
                                                    size="input-sm"
                                                    variant="outline"
                                                    onClick={async () => {
                                                        setEditingLabel(undefined);
                                                    }}
                                                >
                                                    {editingLabel.id === TEMPORARY_ID && <MdOutlineClose />}
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                )}
                                {!editingLabel && (
                                    <Tooltip
                                        label="Add new Label"
                                        openDelay={200}
                                    >
                                        <ActionIcon
                                            size="input-sm"
                                            onClick={onCreateNewLabel}
                                        >
                                            <MdOutlineAdd />
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </Stack>
                        </Fieldset>
                        <Divider />
                        <Space />
                        <Text>Created at {new Date(boardData.createdAt).toLocaleString()}</Text>
                        <Text>Board contains {boardData.totalCards} cards</Text>
                        <Divider />
                        <Space />
                        <Group gap="sm">
                            <Button
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
                            </Button>
                        </Group>
                    </Stack>
                </Box>
            </Stack>
        </ScrollArea>
    );
};

export default BoardSettingsPage;
