import { Box, Group, Loader, ScrollArea, Stack, Text } from '@mantine/core';
import { useIdle } from '@mantine/hooks';
import { DocumentId, fullName } from '@mosaiq/terrazzo-common';
import { CollaborativeTextArea } from '@trz/components/CollaborativeTextArea/CollaborativeTextArea';
import EditableTextbox from '@trz/components/UI/EditableTextbox';
import { NotFound, PageErrors } from '@trz/components/UI/NotFound';
import { useSocket } from '@trz/contexts/socket-context';
import { useUI } from '@trz/contexts/ui-context';
import { useUser } from '@trz/contexts/user-context';
import { updateDocumentMetadata } from '@trz/emitters';
import { useCatchSaveKey } from '@trz/hooks/useCatchSaveKey';
import { useDocument } from '@trz/hooks/useDocument';
import { NoteType, notify } from '@trz/util/notifications';
import { IDLE_TIMEOUT_MS } from '@trz/util/realtimeUtils';
import { setTitle } from '@trz/util/tabUtils';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface DocumentPageProps {
    viewOnly?: boolean;
}
const DocumentPage = (props: DocumentPageProps): React.JSX.Element => {
    const params = useParams();
    const sockCtx = useSocket();
    const uiCtx = useUI();
    const docId = params.documentId as DocumentId | undefined;
    const idle = useIdle(IDLE_TIMEOUT_MS);
    const usr = useUser();
    const { document, lastEditor } = useDocument(docId);
    useCatchSaveKey();
    useEffect(() => {
        setTitle(`${document?.name ?? 'Document'} | Terrazzo`);
    }, [document?.name]);

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
        try {
            if (!document) {
                throw new Error('Document not loaded');
            }
            updateDocumentMetadata(sockCtx, document.id, { name: value });
        } catch (e) {
            notify(NoteType.DOC_UPDATE_ERROR, e);
            return;
        }
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
                            maxWidth: '60rem',
                            paddingTop: '2rem',
                            minWidth: '90%',
                        }}
                    >
                        <Group>
                            <EditableTextbox
                                value={document.name}
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
                                viewOnly={props.viewOnly}
                            />
                        </Group>

                        <CollaborativeTextArea
                            textBlockId={document.textBlockId}
                            maxLineLength={200}
                            placeholder="Start writing here..."
                            idle={idle}
                            name={fullName(usr.userData)}
                            avatarUrl={usr.userData?.profilePicture}
                            viewOnly={props.viewOnly}
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
