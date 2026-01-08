import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { useIdle } from '@mantine/hooks';
import { BLOCKNOTE_FRAGMENT_ID, fullName, TextBlockId, TextSocketHandshakeAuth, UID } from '@mosaiq/terrazzo-common';
import { useUserContext } from '@trz/contexts/user-context';
import { useFileUploader } from '@trz/hooks/useFileUploader';
import { useImageColor } from '@trz/hooks/useImageColor';
import { useMe } from '@trz/hooks/useMe';
import { IDLE_TIMEOUT_MS } from '@trz/util/realtimeUtils';
import { useEffect, useState } from 'react';
import { ManagerOptions, SocketOptions } from 'socket.io-client';
import { ProviderConfiguration, SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';

const IDLE_COLOR = '#afafaf';
enum YSOCKET_STATUS_CODE {
    SYNC = 'sync',
    STATUS = 'status',
    CONNECTION_CLOSED = 'connection-close',
    CONNECTION_ERROR = 'connection-error',
}
const SOCKET_URL = import.meta.env.SOCKET_URL;
if (!SOCKET_URL) throw new Error('SOCKET_URL environment variable is not set');

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
    const [clients, setClients] = useState<string[]>([]);
    const idle = useIdle(IDLE_TIMEOUT_MS);
    const name = fullName(me);

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
        socketIOProvider.awareness.on('change', () => setClients(Array.from(socketIOProvider.awareness.getStates().keys()).map((key) => `${key}`)));
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
            editor.isEditable = !props.viewOnly;
        }
    }, [editor, props.viewOnly]);

    return (
        <div>
            <p>
                Status: {status} | Active Users: {clients.join(', ')} | Synced: {socketIOProvider.synced.toString()}
            </p>
            <BlockNoteView editor={editor} />
        </div>
    );
};
