import '@blocknote/core/fonts/inter.css';
import { BlockNoteView, darkDefaultTheme, lightDefaultTheme, Theme } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { Alert, Group, Stack } from '@mantine/core';
import { useIdle, useThrottledState } from '@mantine/hooks';
import { BLOCKNOTE_FRAGMENT_ID, fullName, RoomType, TextBlockId, TextSocketHandshakeAuth, UID, UserId } from '@mosaiq/terrazzo-common';
import { useUserContext } from '@trz/contexts/user-context';
import { useFileUploader } from '@trz/hooks/useFileUploader';
import { useImageColor } from '@trz/hooks/useImageColor';
import { useMe } from '@trz/hooks/useMe';
import { useRoom } from '@trz/hooks/useRoom';
import { IDLE_TIMEOUT_MS } from '@trz/util/realtimeUtils';
import { useEffect, useMemo, useState } from 'react';
import { ManagerOptions, SocketOptions } from 'socket.io-client';
import { ProviderConfiguration, SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';
import { AvatarRow } from '../UI/AvatarRow';

/** DANGER! Allows anyone to edit the document regardless of permissions. Only for testing server-side auth */
const ALLOW_ANYONE_TO_EDIT = false;

const IDLE_COLOR = '#afafaf';

enum YSOCKET_STATUS_CODE {
    SYNC = 'sync',
    STATUS = 'status',
    CONNECTION_CLOSED = 'connection-close',
    CONNECTION_ERROR = 'connection-error',
}

const SOCKET_URL = import.meta.env.SOCKET_URL;
if (!SOCKET_URL) throw new Error('SOCKET_URL environment variable is not set');

const sharedTheme: Theme = {
    borderRadius: 4,
    fontFamily: 'Helvetica Neue, sans-serif',
};

const lightTheme: Theme = {
    ...sharedTheme,
    colors: {
        editor: {
            text: '#222222',
            background: '#ffeeee',
        },
        menu: {
            text: '#ffffff',
            background: '#9b0000',
        },
        tooltip: {
            text: '#ffffff',
            background: '#b00000',
        },
        hovered: {
            text: '#ffffff',
            background: '#b00000',
        },
        selected: {
            text: '#ffffff',
            background: '#c50000',
        },
        disabled: {
            text: '#9b0000',
            background: '#7d0000',
        },
        shadow: '#640000',
        border: '#870000',
        sideMenu: '#bababa',
        highlights: lightDefaultTheme.colors.highlights,
    },
};

const darkTheme: Theme = {
    ...sharedTheme,
    colors: {
        editor: {
            text: '#ffffff',
            background: '#15161a',
        },
        menu: {
            text: '#ffffff',
            background: '#17191b',
        },
        tooltip: {
            text: '#ffffff',
            background: '#17191b',
        },
        hovered: {
            text: '#ffffff',
            background: '#17191b',
        },
        selected: {
            text: '#ffffff',
            background: '#484f57',
        },
        disabled: {
            text: '#34373b',
            background: '#00000040',
        },
        shadow: '#00000000',
        border: '#828282',
        sideMenu: '#828282',
        highlights: darkDefaultTheme.colors.highlights,
    },
};

const theme = {
    light: lightTheme,
    dark: darkTheme,
};

interface BlockNoteEditorProps {
    textBlockId: TextBlockId;
    fontSize?: number;
    placeholder?: string;
    viewOnly?: boolean;
    resourceId: UID;
    resourceType: TextSocketHandshakeAuth['resource']['type'];
}
export const BlockNoteEditor = (props: BlockNoteEditorProps) => {
    const userCtx = useUserContext();
    const me = useMe();
    const pfpColor = useImageColor(me?.profilePicture);
    const [status, setStatus] = useState<string>('unknown');
    const idle = useIdle(IDLE_TIMEOUT_MS);
    const name = fullName(me);
    const [throttledSyncState, setThrottledSyncState] = useThrottledState<boolean | undefined>(undefined, 500);
    const [showAlerts, setShowAlerts] = useState(false);
    const [roomUsers] = useRoom(RoomType.TEXT, props.textBlockId, undefined, true);
    const roomUserIds = useMemo(() => {
        const ids: Set<UserId> = new Set();
        if (me) {
            ids.add(me.id);
        }
        roomUsers.forEach((u) => ids.add(u.userId));
        return ids;
    }, [roomUsers.values(), me]);

    // Wait 5 seconds before allowing alerts to show
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAlerts(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const [doc] = useState(() => new Y.Doc());
    const [socketIOProvider] = useState(() => {
        const pConf: ProviderConfiguration = {
            autoConnect: true,
        };
        const auth: TextSocketHandshakeAuth = {
            userId: userCtx.userId,
            authToken: userCtx.authToken,
            resource: {
                id: props.resourceId,
                type: props.resourceType,
            },
        };
        const sockConf: Partial<ManagerOptions & SocketOptions> = {
            path: '/socket',
            auth: auth,
        };
        return new SocketIOProvider(SOCKET_URL, props.textBlockId, doc, pConf, sockConf);
    });

    const fileUploader = useFileUploader();

    useEffect(() => {
        socketIOProvider.on('status', ({ status: _status }: { status: string }) => {
            setStatus(_status);
        });
        return () => {
            socketIOProvider.destroy();
        };
    }, [socketIOProvider]);

    useEffect(() => {
        socketIOProvider.awareness.setLocalStateField('user', {
            name: name,
            color: idle ? IDLE_COLOR : (pfpColor ?? '#ffffff'),
        });
    }, [socketIOProvider, pfpColor, idle, name]);

    const editor = useCreateBlockNote({
        collaboration: {
            provider: socketIOProvider,
            fragment: doc.getXmlFragment(BLOCKNOTE_FRAGMENT_ID),
            user: {
                name: name,
                color: idle ? IDLE_COLOR : (pfpColor ?? '#ffffff'),
            },
            showCursorLabels: 'activity',
        },
        uploadFile: fileUploader.uploadFile,
    });

    useEffect(() => {
        if (editor) {
            editor.isEditable = !props.viewOnly || ALLOW_ANYONE_TO_EDIT;
        }
    }, [editor, props.viewOnly]);

    useEffect(() => {
        setThrottledSyncState(socketIOProvider.synced);
    }, [socketIOProvider.synced]);

    return (
        <Stack>
            {!props.viewOnly && showAlerts && status !== 'connected' && (
                <Alert
                    title="Disconnected!"
                    color="red"
                >
                    It seems you are disconnected from the server. Your changes might not be saved.
                </Alert>
            )}
            {!props.viewOnly && showAlerts && throttledSyncState === false && (
                <Alert
                    title="Syncing..."
                    color="yellow"
                >
                    The document is syncing with the server. Some changes might not be visible to other collaborators yet.
                </Alert>
            )}
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
                theme={theme}
            />
        </Stack>
    );
};
