import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { TextBlockId } from '@mosaiq/terrazzo-common';
import { useImageColor } from '@trz/hooks/useImageColor';
import { ProviderConfiguration, SocketIOProvider } from '@trz/util/yjsSocketProvier';
import { useEffect, useState } from 'react';
import { ManagerOptions, SocketOptions } from 'socket.io-client';
import { Doc } from 'yjs';

const IDLE_COLOR = '#afafaf';

interface BlockNoteEditorProps {
    maxLineLength: number;
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
    const [socketIOProvider, setSocketIOProvider] = useState<SocketIOProvider | undefined>();
    const imgColor = useImageColor(props.avatarUrl);
    const [clients, setClients] = useState<string[]>([]);
    const [status, setStatus] = useState<string>('unknown');

    useEffect(() => {
        const doc = new Doc();
        const url = import.meta.env.SOCKET_URL;
        if (!url) throw new Error('SOCKET_URL environment variable is not set');
        const textBlockId = props.textBlockId;
        const pConf: ProviderConfiguration = {
            autoConnect: true,
        };
        const sockConf: Partial<ManagerOptions & SocketOptions> = {
            path: '/socket',
        };
        const _socketIOProvider = new SocketIOProvider(url, textBlockId, doc, pConf, sockConf);
        setSocketIOProvider(_socketIOProvider);

        return () => {
            _socketIOProvider?.destroy();
        };
    }, []);

    useEffect(() => {
        if (!socketIOProvider) {
            return;
        }
        socketIOProvider.awareness.on('change', () => setClients(Array.from(socketIOProvider.awareness.getStates().keys()).map((key) => `${key}`)));
        socketIOProvider.awareness.setLocalStateField('user', {
            name: props.name || 'Unknown User',
            color: props.idle ? IDLE_COLOR : (imgColor ?? props.color ?? 'black'),
        });
        socketIOProvider.on('status', ({ status: _status }: { status: string }) => {
            setStatus(_status);
        });
    }, [socketIOProvider, imgColor, props.color, props.idle, props.name]);

    const editor = useCreateBlockNote({
        // ...
        collaboration: {
            // The Yjs Provider responsible for transporting updates:
            provider: socketIOProvider,
            // Where to store BlockNote data in the Y.Doc:
            fragment: doc.getXmlFragment('document-store'),
            // Information (name and color) for this user:
            user: {
                name: 'My Username',
                color: '#ff0000',
            },
            // When to show user labels on the collaboration cursor. Set by default to
            // "activity" (show when the cursor moves), but can also be set to "always".
            showCursorLabels: 'activity',
        },
    });

    if (!socketIOProvider) {
        return <div>Loading editor...</div>;
    }

    return <BlockNoteView editor={editor} />;
};
