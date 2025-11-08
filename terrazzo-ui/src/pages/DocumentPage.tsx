import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '@trz/contexts/socket-context';
import { BoardHeader, BoardId, CardId, DocumentHeader, DocumentId, Label, LabelId, ListId, UID, UserHeader } from '@mosaiq/terrazzo-common/types';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { ActionIcon, Anchor, Badge, Box, Button, ColorInput, Divider, Fieldset, Group, Loader, Pill, ScrollArea, Select, Space, Stack, Text, Textarea, TextInput, Title, Tooltip } from '@mantine/core';
import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { useRoom } from '@trz/hooks/useRoom';
import { createBoardLabel, deleteBoardLabel, getBoardData, getDocument, getUserHeader, updateBoardField, updateBoardLabel, updateDocumentMetadata } from '@trz/emitters/all';
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
import EditableTextbox from '@trz/components/EditableTextbox';
import { CollaborativeTextArea } from '@trz/components/CollaborativeTextArea/CollaborativeTextArea';
import { useHotkeys, useIdle } from '@mantine/hooks';
import { IDLE_TIMEOUT_MS } from '@trz/util/textUtils';
import { useCatchSaveKey } from '@trz/hooks/useCatchSaveKey';
import { setTitle } from '@trz/util/tabUtils';

const DocumentPage = (): React.JSX.Element => {
    const params = useParams();
    const sockCtx = useSocket();
    const trz = useTRZ();
    const navigate = useNavigate();
    const docId = params.documentId as DocumentId | undefined;
    const [document, setDocument] = useState<DocumentHeader | undefined | null>();
    const [lastEditor, setLastEditor] = useState<UserHeader | null>(null);
    useRoom(RoomType.DATA, docId, false);
    const idle = useIdle(IDLE_TIMEOUT_MS);
    const usr = useUser();
    useCatchSaveKey();

    useEffect(() => {
        const fetchDocumentData = async () => {
            if (!docId || !sockCtx.connected) {
                return;
            }

            try {
                const doc = await getDocument(sockCtx, docId);
                setDocument(doc ?? null);
                setTitle(`${doc?.title ?? 'Document'} | Terrazzo`);
            } catch (err) {
                notify(NoteType.DOC_DATA_ERROR, err);
                return;
            }
        };
        fetchDocumentData();
    }, [docId, sockCtx.connected]);

    useSocketListener<ServerSE.UPDATE_DOCUMENT_FIELD>(ServerSE.UPDATE_DOCUMENT_FIELD, (payload) => {
        setDocument((prev) => {
            if (!prev) {
                return prev;
            }
            return updateBaseFromPartial<DocumentHeader>(prev, payload);
        });
    });

    useEffect(() => {
        const fetchLastEditor = async () => {
            if (!document) {
                return;
            }
            const lastEditor = await getUserHeader(sockCtx, document?.lastModifiedByUserId);
            setLastEditor(lastEditor || null);
        };
        fetchLastEditor();
    }, [document?.lastModifiedByUserId, sockCtx]);

    if (document === undefined) {
        return <Loader />;
    }

    if (document === null || !docId) {
        return (
            <NotFound
                itemType="document"
                error={PageErrors.NOT_FOUND}
            />
        );
    }

    async function onTitleChange(value: string) {
        if (!document) {
            notify(NoteType.DOC_UPDATE_ERROR);
            return;
        }
        try {
            updateDocumentMetadata(sockCtx, document.id, { title: value });
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
                        <Group>
                            <EditableTextbox
                                value={document.title}
                                onChange={onTitleChange}
                                type="title"
                                placeholder="Document Title..."
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

                        <CollaborativeTextArea
                            textBlockId={document.textBlockId}
                            maxLineLength={200}
                            placeholder="Start writing here..."
                            idle={idle}
                            name={fullName(usr.userData)}
                            avatarUrl={usr.userData?.profilePicture}
                        />
                        <Group
                            w="100%"
                            justify="flex-end"
                        >
                            <Text
                                c="dimmed"
                                fz="sm"
                            >
                                Created {new Date(document.createdAt).toLocaleString()}
                                {lastEditor ? ` by ${fullName(lastEditor)}` : ''}
                                {/*
                                    Last editor is currently stuck as the user who created the document.
                                    This is because we don't have a nice way to track who makes edits in the
                                    collaborative text area yet.
                                */}
                            </Text>
                        </Group>
                    </Stack>
                </Box>
            </Stack>
        </ScrollArea>
    );
};

export default DocumentPage;
