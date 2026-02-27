import { Button, Container, Fieldset, FileInput, Group, Select, Space, Stack, Text, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import {
    fullNameWithUsername,
    RestRoutes,
    TrelloExportType,
    TrelloUserToTerrazzoUserMap,
    TrzModule,
    UID,
} from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { createModule } from '@trz/emitters';
import { callTrzApi } from '@trz/util/apiUtils';
import { COLORS } from '@trz/util/colors';
import { NoteType, notify } from '@trz/util/notifications';
import React, { useEffect, useState } from 'react';
import { MdOutlineArrowForward, MdOutlineUploadFile } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const CreateBoard = (props: ContextModalProps<{ parentId: UID }>): React.JSX.Element => {
    const [boardName, setBoardName] = React.useState('');
    const [boardAbbreviation, setBoardAbbreviation] = React.useState('');
    const [errorName, setErrorName] = useState('');
    const [errorAbv, setErrorAbv] = useState('');
    const [trelloImport, setTrelloImport] = useState<File | null>(null);
    const [trelloImportData, setTrelloImportData] = useState<TrelloExportType | null>(null);
    const [trelloImportLoading, setTrelloImportLoading] = useState(false);
    const [trelloUsers, setTrelloUsers] = useState<Record<string, { id: string; name: string; username: string }>>({});
    const [trelloToTrzUserMap, setTrelloToTrzUserMap] = useState<TrelloUserToTerrazzoUserMap>({});
    const sockCtx = useSocket();
    const navigate = useNavigate();
    const orgCtx = useOrg();

    useEffect(() => {
        if (!trelloImport) {
            setTrelloImportData(null);
            return;
        }
        const loadTrelloData = async () => {
            try {
                // Read file
                const text = await trelloImport.text();
                const trelloJson = JSON.parse(text) as TrelloExportType;
                setTrelloImportData(trelloJson);

                // Build user map
                const users: typeof trelloUsers = {};
                for (const user of trelloJson.members) {
                    users[user.id] = {
                        id: user.id,
                        name: user.fullName,
                        username: user.username,
                    };
                }
                setTrelloUsers(users);

                // For now, map all Trello users to undefined
                const userMap: TrelloUserToTerrazzoUserMap = {};
                for (const userId in users) {
                    userMap[userId] = undefined;
                }
                setTrelloToTrzUserMap(userMap);
            } catch (e) {
                notify(NoteType.BOARD_CREATION_ERROR, 'Failed to parse Trello JSON file');
                setTrelloImport(null);
            }
        };
        loadTrelloData();
    }, [trelloImport]);

    async function onSubmit() {
        setErrorAbv('');
        setErrorName('');

        if (boardName.length < 1) {
            setErrorName('Enter a Title');
            return;
        }
        try {
            // const board = await createBoard(sockCtx, boardName, boardAbbreviation, props.innerProps.parentId);
            const board = await createModule(sockCtx, boardName, props.innerProps.parentId, {
                type: TrzModule.Board,
                initialData: {
                    boardCode: boardAbbreviation,
                },
            });
            setBoardName('');
            setBoardAbbreviation('');
            navigate(`/board/${board}`);
            handleClose();
        } catch (e) {
            notify(NoteType.BOARD_CREATION_ERROR, e);
        }
    }

    async function handleImportFromTrello() {
        try {
            if (!trelloImportData) {
                throw new Error('No file provided');
            }
            setTrelloImportLoading(true);
            const res = await callTrzApi(
                RestRoutes.IMPORT_FROM_TRELLO,
                { parentId: props.innerProps.parentId },
                { data: trelloImportData, userMap: trelloToTrzUserMap }
            );
            await new Promise((r) => setTimeout(r, 2000));
            navigate(`/board/${res}`);
            props.context.closeModal(props.id);
            setTrelloImportLoading(false);
        } catch (e: any) {
            notify(NoteType.BOARD_CREATION_ERROR, e);
        }
    }

    const handleClose = () => {
        props.context.closeModal(props.id);
    };

    if (trelloImportData) {
        return (
            <Container>
                <Stack
                    justify="center"
                    align="center"
                    gap="md"
                >
                    <Stack
                        gap="xs"
                        w="100%"
                        p="xs"
                    >
                        <Text
                            fz="sm"
                            c={COLORS.text.muted}
                        >
                            Importing
                        </Text>
                        <Text
                            c={COLORS.text.primary}
                            fw={700}
                        >
                            {trelloImportData.name}
                        </Text>
                        <Group justify="space-between">
                            <Text>{trelloImportData.cards.length} Cards</Text>
                            <Text>{trelloImportData.lists.length} Lists</Text>
                            <Text>{trelloImportData.members.length} Users</Text>
                            <Text>{trelloImportData.labels.length} Labels</Text>
                        </Group>
                    </Stack>
                    <Fieldset legend="Users">
                        <Text
                            fz="xs"
                            c={COLORS.text.muted}
                            mb="xs"
                        >
                            We don't know who's who yet. Map Trello users to Terrazzo users below.
                        </Text>
                        <Stack>
                            {Object.values(trelloUsers).map((user) => (
                                <Group
                                    key={user.id}
                                    wrap="nowrap"
                                >
                                    <Stack
                                        gap={0}
                                        w={'40%'}
                                    >
                                        <Text fw={500}>{user.name}</Text>
                                        <Text
                                            fz="xs"
                                            c={COLORS.text.muted}
                                        >
                                            @{user.username}
                                        </Text>
                                    </Stack>
                                    <MdOutlineArrowForward size="1.5rem" />
                                    <Select
                                        width="40%"
                                        data={[
                                            { value: '', label: 'Unassigned' },
                                            ...orgCtx.members.map((mem) => ({
                                                value: mem.user.id,
                                                label: fullNameWithUsername(mem.user),
                                            })),
                                        ]}
                                        value={trelloToTrzUserMap[user.id] || ''}
                                        onChange={(val) => {
                                            setTrelloToTrzUserMap((prev) => ({
                                                ...prev,
                                                [user.id]: val ? (val as UID) : undefined,
                                            }));
                                        }}
                                    />
                                </Group>
                            ))}
                        </Stack>
                    </Fieldset>
                    <Button
                        fullWidth
                        mt="md"
                        loading={trelloImportLoading}
                        disabled={trelloImportLoading}
                        onClick={handleImportFromTrello}
                    >
                        {trelloImportLoading ? 'Importing...' : 'Import'}
                    </Button>
                </Stack>
            </Container>
        );
    }

    return (
        <Container>
            <Stack
                justify="center"
                align="center"
                gap="md"
            >
                <TextInput
                    label="Board Name"
                    placeholder="Board Name"
                    withAsterisk
                    w={250}
                    value={boardName}
                    onChange={(event) => setBoardName(event.currentTarget.value)}
                    data-autofocus
                    error={errorName}
                />
                <TextInput
                    label="Board Abbreviation"
                    placeholder="Board Abbreviation"
                    error={errorAbv}
                    w={250}
                    value={boardAbbreviation}
                    onChange={(event) => setBoardAbbreviation(event.currentTarget.value)}
                />
            </Stack>

            <Button
                fullWidth
                mt="md"
                onClick={onSubmit}
            >
                Create Board
            </Button>
            <Space />
            <Text
                ta="center"
                py="md"
            >
                or
            </Text>
            <Fieldset>
                <FileInput
                    label="Import from Trello"
                    placeholder="my-board.json"
                    accept="application/json"
                    clearable
                    value={trelloImport}
                    onChange={setTrelloImport}
                    leftSection={<MdOutlineUploadFile />}
                ></FileInput>
            </Fieldset>
        </Container>
    );
};

export const CreateBoardModal = (props: ContextModalProps<{ parentId: UID }>) => <CreateBoard {...props} />;
