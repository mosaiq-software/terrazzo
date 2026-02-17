import { Box, Group, Loader, ScrollArea, Stack, Text } from '@mantine/core';
import { fullName, ModuleId, PermissibleAction, TextBlockResourceType, TrzModule } from '@mosaiq/terrazzo-common';
import { BlockNoteEditor } from '@trz/components/BlockNote/BlockNoteEditor';
import EditableTextbox from '@trz/components/UI/EditableTextbox';
import { NotFound, PageErrors } from '@trz/components/UI/NotFound';
import { useSocket } from '@trz/contexts/socket-context';
import { useUI } from '@trz/contexts/ui-context';
import { updateModuleField } from '@trz/emitters';
import { useModulePermission } from '@trz/hooks/data/usePermissions';
import { useUser } from '@trz/hooks/data/useUser';
import { useModule } from '@trz/hooks/useModule';
import { useCatchSaveKey } from '@trz/hooks/util/useCatchSaveKey';
import { COLORS } from '@trz/util/colors';
import { niceDateWithTime } from '@trz/util/dateUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { setTitle } from '@trz/util/tabUtils';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DocumentPage = (): React.JSX.Element => {
    const params = useParams();
    const sockCtx = useSocket();
    const uiCtx = useUI();
    const docId = params.documentId as ModuleId | undefined;
    const document = useModule(docId, TrzModule.Document);
    const lastEditor = useUser(document?.data.lastModifiedByUserId);
    const userCanExplicitlyViewDocument = useModulePermission(document, PermissibleAction.ViewModules);
    const viewOnly = !userCanExplicitlyViewDocument && document?.public;
    const userCanViewDocument = userCanExplicitlyViewDocument || document?.public;
    const userCanEditDocument = useModulePermission(document, PermissibleAction.ManageModules);

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

    if (!userCanViewDocument) {
        return (
            <NotFound
                itemType="document"
                error={PageErrors.FORBIDDEN}
            />
        );
    }

    async function onTitleChange(value: string) {
        try {
            if (!document) {
                throw new Error('Document not loaded');
            }
            updateModuleField(sockCtx, document.id, {
                type: TrzModule.Document,
                update: {
                    name: value,
                },
            });
        } catch (e) {
            notify(NoteType.DOC_UPDATE_ERROR, e);
            return;
        }
    }

    return (
        <ScrollArea h={`calc(100vh - ${uiCtx.navbarHeight}px)`}>
            <Stack
                bg={COLORS.background.medium}
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
                                    c: COLORS.text.primary,
                                }}
                                inputProps={{
                                    w: '100%',
                                    bg: COLORS.transparent,
                                }}
                                style={{
                                    width: '95%',
                                }}
                                readonly={!userCanEditDocument}
                            />
                        </Group>
                        <BlockNoteEditor
                            textBlockId={document.data.textBlockId}
                            placeholder="Start writing your document or hit '/' for commands..."
                            viewOnly={!userCanEditDocument}
                            resourceType={TextBlockResourceType.Document}
                            resourceId={document.id}
                        />
                        <Group
                            w="100%"
                            justify="flex-end"
                        >
                            <Text
                                c={COLORS.text.muted}
                                fz="sm"
                            >
                                Created {niceDateWithTime(document.createdAt)}
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
