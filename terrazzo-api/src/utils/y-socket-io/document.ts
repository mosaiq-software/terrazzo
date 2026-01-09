import { YjsEvent } from '@mosaiq/terrazzo-common';
import { TextBlockId } from '@mosaiq/terrazzo-common/types/genericTypes';
import { Namespace, Socket } from 'socket.io';
import * as AwarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';
import { getYSocketData } from '../socket/socketUtils';

export interface AwarenessChange {
    added: number[];
    updated: number[];
    removed: number[];
}

const gcEnabled = true;

/**
 * Document callbacks. Here you can set:
 * - onUpdate: Set a callback that will be triggered when the document is updated
 * - onChangeAwareness: Set a callback that will be triggered when the awareness is updated
 * - onDestroy: Set a callback that will be triggered when the document is destroyed
 */
export interface Callbacks {
    /**
     * Set a callback that will be triggered when the document is updated
     */
    onUpdate?: (doc: Document, docUpdate: Uint8Array) => void;
    /**
     * Set a callback that will be triggered when the awareness is updated
     */
    onChangeAwareness?: (doc: Document, awarenessUpdate: Uint8Array) => void;
    /**
     * Set a callback that will be triggered when the document is destroyed
     */
    onDestroy?: (doc: Document) => Promise<void>;
}

/**
 * YSocketIO document
 */
export class Document extends Y.Doc {
    public textBlockId: TextBlockId;
    private readonly namespace: Namespace;
    public awareness: AwarenessProtocol.Awareness;
    private readonly callbacks?: Callbacks;
    public lastSavedAt: number;
    public saveTimer?: NodeJS.Timeout;
    public isSaving: boolean = false;

    constructor(textBlockId: TextBlockId, namespace: Namespace, callbacks?: Callbacks) {
        super({ gc: gcEnabled });
        this.textBlockId = textBlockId;
        this.namespace = namespace;
        this.awareness = new AwarenessProtocol.Awareness(this);
        this.awareness.setLocalState(null);
        this.callbacks = callbacks;
        this.lastSavedAt = Date.now();

        this.awareness.on(YjsEvent.UPDATE, this.onUpdateAwareness);

        this.on(YjsEvent.UPDATE, this.onUpdateDoc);
    }

    /**
     * Handles the document's update and emit eht changes to clients.
     */
    private readonly onUpdateDoc = (update: Uint8Array): void => {
        if (this.callbacks?.onUpdate != null) {
            try {
                this.callbacks.onUpdate(this, update);
            } catch (error) {
                console.warn(error);
            }
        }
        this.namespace.emit(YjsEvent.SYNC_UPDATE, update);
    };

    /**
     * Handles the awareness update and emit the changes to clients.
     */
    private readonly onUpdateAwareness = ({ added, updated, removed }: AwarenessChange, _socket: Socket | null): void => {
        //Check that the user is an editor before emitting awareness changes
        if (!_socket) {
            return;
        }
        const socketData = getYSocketData(_socket);
        if (!socketData?.canEdit) {
            return;
        }

        const changedClients = added.concat(updated, removed);
        const update = AwarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients);
        if (this.callbacks?.onChangeAwareness != null) {
            try {
                this.callbacks.onChangeAwareness(this, update);
            } catch (error) {
                console.warn(error);
            }
        }
        this.namespace.emit(YjsEvent.AWARENESS_UPDATE, update);
    };

    /**
     * Destroy the document and remove the listeners.
     */
    public async destroy(): Promise<void> {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        if (this.callbacks?.onDestroy != null) {
            try {
                await this.callbacks.onDestroy(this);
            } catch (error) {
                console.warn(error);
            }
        }
        this.awareness.off(YjsEvent.UPDATE, this.onUpdateAwareness);
        this.off(YjsEvent.UPDATE, this.onUpdateDoc);
        this.namespace.disconnectSockets();
        super.destroy();
    }
}
