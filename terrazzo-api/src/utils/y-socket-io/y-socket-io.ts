/**
 * YSocketIO module based on the y-socket.io library
 * https://github.com/ivan-topp/y-socket.io/blob/main/src/server/y-socket-io.ts
 */

/**
 *  The synchronization protocol is as follows:
 *
 *  - A client emits the sync step one event (`sync-step-1`) which sends the document as a state vector
 *    and the sync step two callback as an acknowledgment according to the socket io acknowledgments.
 *
 *  - When the server receives the `sync-step-1` event, it executes the `syncStep2` acknowledgment callback and sends
 *    the difference between the received state vector and the local document (this difference is called an update).
 *
 *  - The second step of the sync is to apply the update sent in the `syncStep2` callback parameters from the server
 *    to the document on the client side.
 *
 *  - There is another event (`sync-update`) that is emitted from the client, which sends an update for the document,
 *    and when the server receives this event, it applies the received update to the local document.
 *
 *  - When an update is applied to a document, it will fire the document's "update" event, which
 *    sends the update to clients connected to the document's namespace.
 *
 *
 *
 *  The awareness protocol is as follows:
 *  - A client emits the `awareness-update` event by sending the awareness update.
 *  - The server receives that event and applies the received update to the local awareness.
 *  - When an update is applied to awareness, the awareness "update" event will fire, which
 *    sends the update to clients connected to the document namespace.
 */

import { ServerSocketIOEvent, SocketHandshakeAuth, TextBlockId, YjsEvent } from '@mosaiq/terrazzo-common';
import { checkCanUserEditTextBlock, loadTextBlockEncodedData, storeTextBlockEncodedData } from '@trz-api/controllers/textBlockController';
import { Observable } from 'lib0/observable';
import { Namespace, Server, Socket } from 'socket.io';
import * as AwarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';
import { YSocketData } from '../socket/socketTypes';
import { getValidAuthSessionFromSocketHandshake, getYSocketData, setYSocketData } from '../socket/socketUtils';
import { Callbacks, Document } from './document';

/**
 * Simple persistence object using string storage
 */
export interface Persistence {
    bindState: (textBlockId: TextBlockId, ydoc: Document) => Promise<void>;
    writeState: (textBlockId: TextBlockId, ydoc: Document) => Promise<void>;
}

/**
 * Frequency of automatic document saves in milliseconds.
 * @default 5sec
 */
const DOC_AUTOSAVE_INTERVAL_MS = 1000 * 5;

export class YSocketIO extends Observable<string> {
    private readonly _documents: Map<string, Document> = new Map<string, Document>();
    private readonly io: Server;
    private readonly persistence: Persistence;
    public nsp: Namespace | null = null;

    constructor(io: Server) {
        super();
        this.io = io;
        this.persistence = this.initStringPersistence();
    }

    /**
     * YSocketIO initialization.
     *
     *  This method set ups a dynamic namespace manager for namespaces that match with the regular expression `/^\/yjs\|.*$/`
     *  and adds the connection authentication middleware to the dynamics namespaces.
     *
     *  It also starts socket connection listeners.
     */
    public initialize(): void {
        this.nsp = this.io.of(/^\/yjs\|.*$/);

        this.nsp.on(ServerSocketIOEvent.CONNECTION, async (socket) => {
            const textBlockId = socket.nsp.name.replace(/\/yjs\|/, '') as TextBlockId;
            const authSession = await getValidAuthSessionFromSocketHandshake(socket.handshake.auth as any as SocketHandshakeAuth);

            const canEdit = !!authSession?.userId && (await checkCanUserEditTextBlock(authSession.userId, textBlockId));

            const sockData: YSocketData = {
                sid: socket.id,
                userId: authSession?.userId,
                authToken: authSession?.authToken,
                connectedAt: new Date(),
                canEdit: canEdit,
            };
            setYSocketData(socket, sockData);

            const doc = await this.initDocument(textBlockId, socket.nsp);
            await this.initPublicListeners(socket, doc);
            await this.initWriteOnlyListeners(socket, doc);
            await this.startSynchronization(socket, doc);
        });
    }

    /**
     * The document map's getter. If you want to delete a document externally, make sure you don't delete
     * the document directly from the map, instead use the "destroy" method of the document you want to delete,
     * this way when you destroy the document you are also closing any existing connection on the document.
     */
    public get documents(): Map<string, Document> {
        return this._documents;
    }

    /**
     * This method creates a yjs document if it doesn't exist in the document map. If the document exists, get the map document.
     *
     *  - If document is created:
     *      - Binds the document to string persistence.
     *      - Adds the new document to the documents map.
     *      - Emit the `document-loaded` event
     */
    private async initDocument(textBlockId: TextBlockId, namespace: Namespace): Promise<Document> {
        let doc = this._documents.get(textBlockId);
        if (!doc) {
            const callbacks: Callbacks = {
                onUpdate: async (doc, update) => {
                    this.emit(YjsEvent.DOCUMENT_UPDATE, [doc, update]);
                    // Save document when updated
                    const lastSave = doc.lastSavedAt;
                    const now = Date.now();
                    if (now - lastSave > DOC_AUTOSAVE_INTERVAL_MS) {
                        doc.lastSavedAt = now;
                        await this.persistence.writeState(doc.textBlockId, doc);
                    }
                },
                onChangeAwareness: (doc, update) => this.emit(YjsEvent.AWARENESS_UPDATE, [doc, update]),
                onDestroy: async (doc) => {
                    this._documents.delete(doc.textBlockId);
                    this.emit(YjsEvent.DOCUMENT_DESTROY, [doc]);
                },
            };
            doc = new Document(textBlockId, namespace, callbacks);
        }
        doc.gc = true;
        if (!this._documents.has(textBlockId)) {
            // Load existing document data if available
            await this.persistence.bindState(textBlockId, doc);
            this._documents.set(textBlockId, doc);
            this.emit(YjsEvent.DOCUMENT_LOADED, [doc]);
        }
        return doc;
    }

    private initStringPersistence(): Persistence {
        return {
            bindState: async (textBlockId: TextBlockId, ydoc: Document) => {
                // Load existing document data if available
                const persistedData = await loadTextBlockEncodedData(textBlockId);
                if (persistedData) {
                    try {
                        // Convert the stored string back to Uint8Array and apply to document
                        const uint8Array = new Uint8Array(Buffer.from(persistedData, 'base64'));
                        Y.applyUpdate(ydoc, uint8Array);
                    } catch (error) {
                        console.error(`Error loading document ${textBlockId}:`, error);
                    }
                }
            },
            writeState: async (textBlockId: TextBlockId, ydoc: Document) => {
                try {
                    // Encode the document state as an update and convert to base64 string
                    const update = Y.encodeStateAsUpdate(ydoc);
                    const base64String = Buffer.from(update).toString('base64');
                    await storeTextBlockEncodedData(textBlockId, base64String);
                } catch (error) {
                    console.error(`Error storing document ${textBlockId}:`, error);
                }
            },
        };
    }

    private readonly initPublicListeners = async (socket: Socket, doc: Document) => {
        socket.on(YjsEvent.SYNC_STEP_1, (stateVector: Uint8Array, syncStep2: (update: Uint8Array) => void) => {
            const diffVec = Y.encodeStateAsUpdate(doc, new Uint8Array(stateVector));
            syncStep2(diffVec);
        });

        socket.on(ServerSocketIOEvent.DISCONNECT, async () => {
            const allSockets = socket.nsp.sockets.entries();
            const socketsWithEditPermissions = Array.from(allSockets).filter(([_, s]) => {
                const sockData = getYSocketData(s);
                return sockData?.canEdit;
            });
            if (socketsWithEditPermissions.length === 0) {
                this.emit(YjsEvent.ALL_DOCUMENT_CONNECTIONS_CLOSED, [doc]);

                // Persist document state when all connections are closed and destroy the document
                await this.persistence.writeState(doc.textBlockId, doc);
                await doc.destroy();
            }
        });

        socket.on(YjsEvent.AWARENESS_UPDATE, (update: ArrayBuffer) => {
            AwarenessProtocol.applyAwarenessUpdate(doc.awareness, new Uint8Array(update), socket);
        });
    };

    private readonly initWriteOnlyListeners = async (socket: Socket, doc: Document) => {
        // Regardless of permissions, all sockets will have the event listeners registered,
        // but only sockets with edit permissions will be able to make changes to the document.
        // Should the permissions change, this will allow the socket to continue functioning without needing to reconnect.
        socket.on(YjsEvent.SYNC_UPDATE, (update: Uint8Array) => {
            const socketData = getYSocketData(socket);
            if (!socketData?.canEdit) {
                return;
            }
            Y.applyUpdate(doc, update, null);
        });
    };

    private readonly startSynchronization = async (socket: Socket, doc: Document) => {
        socket.emit(YjsEvent.SYNC_STEP_1, Y.encodeStateVector(doc), (update: Uint8Array) => {
            Y.applyUpdate(doc, new Uint8Array(update), this);
        });
        socket.emit(YjsEvent.AWARENESS_UPDATE, AwarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(doc.awareness.getStates().keys())));
    };
}
