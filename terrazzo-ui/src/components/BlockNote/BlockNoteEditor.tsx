import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { TextBlockId } from '@mosaiq/terrazzo-common';
import { useImageColor } from '@trz/hooks/useImageColor';
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
    name?: string;
    color?: string;
    avatarUrl?: string;
    idle: boolean;
    viewOnly?: boolean;
}
export const BlockNoteEditor = (props: BlockNoteEditorProps) => {
    const imgColor = useImageColor(props.avatarUrl);
    const [status, setStatus] = useState<string>('unknown');
    const [clients, setClients] = useState<string[]>([]);

    const [doc] = useState(() => new Y.Doc());
    const [socketIOProvider] = useState(() => {
        const pConf: ProviderConfiguration = {
            autoConnect: true,
        };
        const sockConf: Partial<ManagerOptions & SocketOptions> = {
            path: '/socket',
        };
        return new SocketIOProvider(SOCKET_URL, props.textBlockId, doc, pConf, sockConf);
    });

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
            name: props.name || 'Unknown User',
            color: props.idle ? IDLE_COLOR : (imgColor ?? props.color ?? 'black'),
        });
    }, [socketIOProvider, imgColor, props.color, props.idle, props.name]);

    const editor = useCreateBlockNote({
        collaboration: {
            provider: socketIOProvider,
            fragment: doc.getXmlFragment('document-store'),
            user: {
                name: props.name || 'Unknown User',
                color: props.idle ? IDLE_COLOR : (imgColor ?? props.color ?? 'black'),
            },
            showCursorLabels: 'activity',
        },
    });

    return (
        <div>
            <p>
                Status: {status} | Active Users: {clients.join(', ')} | Synced: {socketIOProvider.synced.toString()}
            </p>
            <BlockNoteView editor={editor} />
        </div>
    );
};
