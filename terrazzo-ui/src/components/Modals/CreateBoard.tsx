import { Button, Container, Fieldset, FileInput, Flex, Space, Text, TextInput } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { RestRoutes, TrelloExportType, UID } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { createBoard } from '@trz/emitters';
import { callTrzApi } from '@trz/util/apiUtils';
import { NoteType, notify } from '@trz/util/notifications';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateBoard = (props: ContextModalProps<{ parentId: UID }>): React.JSX.Element => {
    const [boardName, setBoardName] = React.useState('');
    const [boardAbbreviation, setBoardAbbreviation] = React.useState('');
    const [errorName, setErrorName] = useState('');
    const [errorAbv, setErrorAbv] = useState('');
    const [trelloImport, setTrelloImport] = useState<File | null>(null);
    const [trelloImportStatus, setTrelloImportStatus] = useState<string>('Upload');
    const sockCtx = useSocket();
    const navigate = useNavigate();

    async function onSubmit() {
        setErrorAbv('');
        setErrorName('');

        if (boardName.length < 1) {
            setErrorName('Enter a Title');
            return;
        }
        try {
            const board = await createBoard(sockCtx, boardName, boardAbbreviation, props.innerProps.parentId);
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
            if (!trelloImport) {
                throw new Error('No file provided');
            }
            setTrelloImportStatus('Uploading... This may take some time');
            const text = await trelloImport.text();
            const json = JSON.parse(text) as TrelloExportType;
            const res = await callTrzApi(RestRoutes.IMPORT_FROM_TRELLO, { parentId: props.innerProps.parentId }, json);
            setTrelloImportStatus('Loading...');
            await new Promise((r) => setTimeout(r, 2000));
            navigate(`/board/${res}`);
        } catch (e: any) {
            notify(NoteType.BOARD_CREATION_ERROR, e);
        }
        setTrelloImportStatus('Upload');
        props.context.closeModal(props.id);
    }

    const handleClose = () => {
        props.context.closeModal(props.id);
    };

    return (
        <Container
            onKeyDown={getHotkeyHandler([
                ['Enter', onSubmit],
                ['Escape', handleClose],
            ])}
        >
            <Flex
                direction="column"
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
            </Flex>

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
                    placeholder="board.json"
                    accept="application/json"
                    clearable
                    value={trelloImport}
                    onChange={setTrelloImport}
                />
                <Button
                    fullWidth
                    mt="md"
                    onClick={handleImportFromTrello}
                    disabled={!trelloImport}
                >
                    {trelloImportStatus}
                </Button>
            </Fieldset>
        </Container>
    );
};

export const CreateBoardModal = (props: ContextModalProps<{ parentId: UID }>) => <CreateBoard {...props} />;
