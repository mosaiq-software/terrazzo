import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useIdle, useThrottledState } from '@mantine/hooks';
import { fullName, TextBlockId, TextSocketHandshakeAuth, UID } from '@mosaiq/terrazzo-common';
import { useUserContext } from '@trz/contexts/user-context';
import { useImageColor } from '@trz/hooks/useImageColor';
import { useMe } from '@trz/hooks/useMe';
import { IDLE_TIMEOUT_MS } from '@trz/util/realtimeUtils';
import { useEffect, useMemo, useState } from 'react';
import { ManagerOptions, SocketOptions } from 'socket.io-client';
import { ProviderConfiguration, SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';
import { BaseBlockNoteEditor } from './BaseBlockNoteEditor';

const IDLE_COLOR = '#afafaf';

enum YSOCKET_STATUS_CODE {
    SYNC = 'sync',
    STATUS = 'status',
    CONNECTION_CLOSED = 'connection-close',
    CONNECTION_ERROR = 'connection-error',
}

const SOCKET_URL = import.meta.env.SOCKET_URL;

interface BlockNoteEditorProps {
    /** The ID of the text block to be edited */
    textBlockId: TextBlockId;
    /** Optional font size for the editor */
    fontSize?: number;
    /** Optional placeholder text for the editor */
    placeholder?: string;
    /** Whether the editor should be in view-only mode */
    viewOnly?: boolean;
    /** The resource (doc, card, etc..) ID associated with the text block */
    resourceId: UID;
    /** The resource (doc, card, etc..) type associated with the text block */
    resourceType: TextSocketHandshakeAuth['resource']['type'];
}
/**
 * Full BlockNote Editor component that creates its own socket for collaboration
 */
export const BlockNoteEditor = (props: BlockNoteEditorProps) => {
    const userCtx = useUserContext();
    const me = useMe();
    const pfpColor = useImageColor(me?.profilePicture);
    const [status, setStatus] = useState<string>('unknown');
    const idle = useIdle(IDLE_TIMEOUT_MS);
    const name = fullName(me);
    const [throttledSyncState, setThrottledSyncState] = useThrottledState<boolean | undefined>(undefined, 500);
    const userColor = useMemo(() => {
        return idle ? IDLE_COLOR : (pfpColor ?? '#ffffff');
    }, [idle, pfpColor]);

    const [provider, setProvider] = useState<{ doc: Y.Doc; socket: SocketIOProvider } | undefined>(undefined);

    useEffect(() => {
        setProvider(undefined);
        setStatus('connecting');
        setThrottledSyncState(undefined);

        const doc = new Y.Doc();
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
        const socketIOProvider = new SocketIOProvider(SOCKET_URL, props.textBlockId, doc, pConf, sockConf);

        socketIOProvider.on('status', ({ status: _status }: { status: string }) => {
            setStatus(_status);
        });
        setProvider({ doc, socket: socketIOProvider });

        return () => {
            doc.destroy();
            socketIOProvider.destroy();
        };
    }, [userCtx.userId, userCtx.authToken, props.resourceId, props.resourceType, props.textBlockId]);

    useEffect(() => {
        if (!provider) {
            return;
        }
        provider.socket.awareness.setLocalStateField('user', {
            name: name,
            color: userColor,
        });
    }, [provider?.socket, userColor, name]);

    useEffect(() => {
        setThrottledSyncState(provider?.socket.synced);
    }, [provider?.socket.synced]);

    if (!provider) {
        return null;
    }

    return (
        <BaseBlockNoteEditor
            key={props.textBlockId}
            socketIOProvider={provider.socket}
            doc={provider.doc}
            textBlockId={props.textBlockId}
            placeholder={props.placeholder}
            viewOnly={props.viewOnly}
            myId={userCtx.userId}
            myName={name}
            pfpColor={userColor}
            syncStatus={throttledSyncState}
            connectionStatus={status}
        />
    );
};
