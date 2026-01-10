import { codeBlockOptions } from '@blocknote/code-block';
import { BlockNoteSchema, createCodeBlockSpec } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { en } from '@blocknote/core/locales';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { Alert, Group, Stack } from '@mantine/core';
import { BLOCKNOTE_FRAGMENT_ID, RoomType, TextBlockId, UserId } from '@mosaiq/terrazzo-common';
import { useFileUploader } from '@trz/hooks/useFileUploader';
import { useRoom } from '@trz/hooks/useRoom';
import { useEffect, useMemo, useState } from 'react';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';
import { AvatarRow } from '../UI/AvatarRow';
import { blockNoteEditorTheme } from './BlockNoteEditorTheme';
import './BlockNoteStyleOverrides.css';

/** DANGER! Allows anyone to edit the document regardless of permissions. Only for testing server-side auth */
const ALLOW_ANYONE_TO_EDIT = false;

interface BaseEditorProps {
    socketIOProvider: SocketIOProvider;
    doc: Y.Doc;
    textBlockId: TextBlockId;
    placeholder?: string;
    viewOnly?: boolean;
    myId: UserId | undefined;
    myName: string;
    pfpColor: string;
    syncStatus: boolean | undefined;
    connectionStatus: string;
}
/**
 * Base BlockNote Editor component that render the editor with collaboration features
 * Does not create its own socket.
 * @see BlockNoteEditor for the full component that creates its own socket
 */
export const BaseBlockNoteEditor = (props: BaseEditorProps) => {
    const [showAlerts, setShowAlerts] = useState(false);
    const [roomUsers] = useRoom(RoomType.TEXT, props.textBlockId, undefined, true);
    const roomUserIds = useMemo(() => {
        const ids: Set<UserId> = new Set();
        if (props.myId) {
            ids.add(props.myId);
        }
        roomUsers.forEach((u) => ids.add(u.userId));
        return ids;
    }, [roomUsers.values(), props.myId]);

    const fileUploader = useFileUploader();

    // Wait 5 seconds before allowing alerts to show
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAlerts(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const locale = en;
    const editor = useCreateBlockNote(
        {
            collaboration: {
                provider: props.socketIOProvider,
                fragment: props.doc.getXmlFragment(BLOCKNOTE_FRAGMENT_ID),
                user: {
                    name: props.myName,
                    color: props.pfpColor,
                },
                showCursorLabels: 'activity',
            },
            uploadFile: fileUploader.uploadFile,
            schema: BlockNoteSchema.create().extend({
                blockSpecs: {
                    codeBlock: createCodeBlockSpec(codeBlockOptions),
                },
            }),
            placeholders: {
                ...locale.placeholders,
                emptyDocument: props.placeholder || locale.placeholders.emptyDocument,
            },
        },
        [props.textBlockId, props.socketIOProvider, props.doc]
    );

    useEffect(() => {
        if (editor) {
            editor.isEditable = !props.viewOnly || ALLOW_ANYONE_TO_EDIT;
        }
    }, [editor, props.viewOnly]);

    return (
        <Stack>
            {!props.viewOnly &&
                showAlerts &&
                (props.connectionStatus !== 'connected' ? (
                    <Alert
                        title="Disconnected!"
                        color="red"
                    >
                        It seems you are disconnected from the server. Your changes might not be saved.
                    </Alert>
                ) : props.syncStatus === undefined ? (
                    <Alert
                        title="Connecting..."
                        color="blue"
                    >
                        Establishing connection to the server...
                    </Alert>
                ) : (
                    props.syncStatus === false && (
                        <Alert
                            title="Syncing..."
                            color="yellow"
                        >
                            The document is syncing with the server. Some changes might not be visible to other collaborators yet.
                        </Alert>
                    )
                ))}
            <Group justify="flex-end">
                <AvatarRow
                    users={Array.from(roomUserIds.values())}
                    maxUsers={5}
                    showTooltip
                    showProfilePopover
                    animateOnHover
                />
            </Group>
            <BlockNoteView
                editor={editor}
                theme={blockNoteEditorTheme}
            />
        </Stack>
    );
};
