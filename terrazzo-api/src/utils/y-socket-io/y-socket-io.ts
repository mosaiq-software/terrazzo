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

import {
    ServerSocketIOEvent,
    TextBlockId,
    TextBlockResourceType,
    TextSocketHandshakeAuth,
    UID,
    UserId,
    YjsEvent,
} from '@mosaiq/terrazzo-common';
import {
    checkCanUserEditTextBlock,
    loadTextBlockEncodedData,
    storeTextBlockEncodedData,
} from '@trz-api/controllers/textBlockController';
import { Observable } from 'lib0/observable';
import { Namespace, Server, Socket } from 'socket.io';
import * as AwarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';
import { YSocketData } from '../socket/socketTypes';
import { getValidAuthSessionFromSocketHandshake, getYSocketData, setYSocketData } from '../socket/socketUtils';
import { Document } from './document';

/**
 * Frequency of automatic document saves in milliseconds.
 * @default 5sec
 */
const DOC_AUTOSAVE_INTERVAL_MS = 1000 * 5;

export class YSocketIO extends Observable<string> {
    private readonly _documents: Map<string, Document> = new Map<string, Document>();
    private readonly io: Server;
    public nsp: Namespace | null = null;

    constructor(io: Server) {
        super();
        this.io = io;
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
            const auth = socket.handshake.auth as TextSocketHandshakeAuth;
            const authSession = await getValidAuthSessionFromSocketHandshake(auth);
            const authorizedTextBlockId = await checkCanUserEditTextBlock(
                auth.userId,
                auth.resourceId,
                auth.resourceType
            );
            const canEdit = !!authSession?.userId && !!authorizedTextBlockId && authorizedTextBlockId === textBlockId;

            const sockData: YSocketData = {
                sid: socket.id,
                userId: authSession?.userId,
                authToken: authSession?.authToken,
                connectedAt: new Date(),
                canEdit: canEdit,
            };
            setYSocketData(socket, sockData);

            const doc = await this.initDocument(textBlockId, auth.resourceId, auth.resourceType, socket.nsp);
            await this.initPublicListeners(socket, doc);
            await this.initWriteOnlyListeners(socket, doc);
            await this.startSynchronization(socket, doc);
        });
    }

    /**
     * Sync the edit permissions for all sockets of a given user across all documents.
     */
    public async syncSocketEditStatusForUser(userId: UserId): Promise<void> {
        if (!this.nsp) {
            return;
        }
        const sockets = Array.from(this.nsp.sockets.values());
        const syncPromises = sockets.map((socket) => this.syncSocketEditStatusForSocket(socket, userId));
        await Promise.all(syncPromises);
    }

    /**
     * Broadcast a document update to all connected clients for a specific text block.
     * This overwrites the document content and syncs it to all clients in real-time.
     * Useful for operations like version history restoration.
     *
     * @param textBlockId - The ID of the text block to update
     * @param ydoc - The Y.Doc containing the new content to broadcast
     * @returns true if broadcast succeeded, false if document not found or not initialized
     */
    public async broadcastDocumentUpdate(textBlockId: TextBlockId, ydoc: Y.Doc): Promise<boolean> {
        const doc = this._documents.get(textBlockId);
        if (!doc) {
            console.warn(`Cannot broadcast update: Document ${textBlockId} not found in active documents`);
            return false;
        }
        const update = Y.encodeStateAsUpdate(ydoc);
        Y.applyUpdate(doc, update, this);
        console.log(`Broadcasted document update for text block ${textBlockId} to all connected clients`);
        return true;
    }

    private async syncSocketEditStatusForSocket(socket: Socket, userId: UserId): Promise<void> {
        try {
            const auth = socket.handshake.auth as TextSocketHandshakeAuth;
            const sockData = getYSocketData(socket);
            if (auth.userId !== userId || !sockData?.userId || sockData.userId !== userId) {
                return;
            }
            const authorizedTextBlockId = await checkCanUserEditTextBlock(userId, auth.resourceId, auth.resourceType);
            sockData.canEdit = !!authorizedTextBlockId;
            setYSocketData(socket, sockData);
        } catch (error) {
            console.error(`Error syncing socket edit status for user ${userId} on socket ${socket.id}:`, error);
        }
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
    private async initDocument(
        textBlockId: TextBlockId,
        resourceId: UID,
        resourceType: TextBlockResourceType,
        namespace: Namespace
    ): Promise<Document> {
        const existingDoc = this._documents.get(textBlockId);
        if (existingDoc) {
            return existingDoc;
        }

        const newDoc = new Document(textBlockId, resourceId, resourceType, namespace, {
            onUpdate: async (doc, update) => {
                this.emit(YjsEvent.DOCUMENT_UPDATE, [doc, update]);
                // Debounce saves using a timer
                if (doc.saveTimer) {
                    clearTimeout(doc.saveTimer);
                }
                doc.saveTimer = setTimeout(async () => {
                    doc.saveTimer = undefined;
                    if (doc.isSaving) {
                        return; // Skip if save already in progress
                    }
                    doc.isSaving = true;
                    try {
                        await storeTextBlockEncodedData(doc);
                    } catch (error) {
                        console.error(`Save failed for ${doc.textBlockId}, retrying...`, error);
                        // Retry once after 1 second
                        setTimeout(async () => {
                            try {
                                await storeTextBlockEncodedData(doc);
                            } catch (retryError) {
                                console.error(`Retry save failed for ${doc.textBlockId}`, retryError);
                            }
                        }, 1000);
                    } finally {
                        doc.isSaving = false;
                    }
                }, DOC_AUTOSAVE_INTERVAL_MS);
            },
            onChangeAwareness: (doc, update) => this.emit(YjsEvent.AWARENESS_UPDATE, [doc, update]),
            onDestroy: async (doc) => {
                this._documents.delete(doc.textBlockId);
                this.emit(YjsEvent.DOCUMENT_DESTROY, [doc]);
            },
        });
        newDoc.gc = true;
        // Load existing document data if available
        const ydoc = await loadTextBlockEncodedData(textBlockId);
        if (ydoc) {
            const update = Y.encodeStateAsUpdate(ydoc);
            Y.applyUpdate(newDoc, update, this);
            this.emit(YjsEvent.DOCUMENT_LOADED, [newDoc]);
        }
        this._documents.set(textBlockId, newDoc);
        this.emit(YjsEvent.DOCUMENT_LOADED, [newDoc]);
        return newDoc;
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
                console.log(
                    `No more sockets with edit permissions connected to document ${doc.textBlockId}. Saving and destroying document.`
                );

                // Cancel pending timer to force immediate save
                if (doc.saveTimer) {
                    clearTimeout(doc.saveTimer);
                    doc.saveTimer = undefined;
                }

                // Wait for any in-progress save to complete (max 5 seconds)
                let waitCount = 0;
                while (doc.isSaving && waitCount < 50) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    waitCount++;
                }

                // Final save before destroy
                try {
                    await storeTextBlockEncodedData(doc, true);
                } catch (error) {
                    console.error(`Final save failed for ${doc.textBlockId}:`, error);
                }

                this.emit(YjsEvent.ALL_DOCUMENT_CONNECTIONS_CLOSED, [doc]);
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
        // Send SYNC_STEP_1 with state vector to mark as synced
        const stateVector = Y.encodeStateVector(doc);
        socket.emit(YjsEvent.SYNC_STEP_1, stateVector, () => {
            // Empty callback - client expects this function
        });

        // Also send the full document state as a SYNC_UPDATE so client gets the content
        const fullState = Y.encodeStateAsUpdate(doc);
        socket.emit(YjsEvent.SYNC_UPDATE, fullState);

        // Send current awareness state
        const awarenessStates = Array.from(doc.awareness.getStates().keys());
        if (awarenessStates.length > 0) {
            const awarenessUpdate = AwarenessProtocol.encodeAwarenessUpdate(doc.awareness, awarenessStates);
            socket.emit(YjsEvent.AWARENESS_UPDATE, awarenessUpdate);
        }
    };
}
