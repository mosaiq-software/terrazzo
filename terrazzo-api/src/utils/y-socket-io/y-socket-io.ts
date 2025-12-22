/**
 * YSocketIO module based on the y-socket.io library
 * https://github.com/ivan-topp/y-socket.io/blob/main/src/server/y-socket-io.ts
 */

import { ServerSocketIOEvent, TextBlockId, YjsEvent } from '@mosaiq/terrazzo-common';
import { loadTextBlockEncodedData, storeTextBlockEncodedData } from '@trz-api/controllers/textBlockController';
import { Observable } from 'lib0/observable';
import { Namespace, Server, Socket } from 'socket.io';
import * as AwarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';
import { YSocketData } from '../socket/socketTypes';
import { setYSocketData } from '../socket/socketUtils';
import { Document } from './document';

/**
 * Simple persistence object using string storage
 */
export interface Persistence {
    bindState: (textBlockId: TextBlockId, ydoc: Document) => Promise<void>;
    writeState: (textBlockId: TextBlockId, ydoc: Document) => Promise<void>;
}

/**
 * YSocketIO instance cofiguration. Here you can configure:
 * - gcEnabled: Enable/Disable garbage collection (default: gc=true)
 * - levelPersistenceDir: The directory path where the persistent Level database will be stored
 * - authenticate: The callback to authenticate the client connection
 */
export interface YSocketIOConfiguration {
    /**
     * Enable/Disable garbage collection (default: gc=true)
     */
    gcEnabled?: boolean;
    /**
     * Callback to authenticate the client connection.
     *
     *  It can be a promise and if it returns true, the connection is allowed; otherwise, if it returns false, the connection is rejected.
     * @param handshake Provided from the handshake attribute of the socket io
     * @throws Will throw an error if the authentication fails
     */
    initializeSocket: (socket: Socket) => Promise<YSocketData> | YSocketData;
}

/**
 * YSocketIO class. This handles document synchronization.
 */
export class YSocketIO extends Observable<string> {
    private readonly _documents: Map<string, Document> = new Map<string, Document>();
    private readonly io: Server;
    private readonly configuration?: YSocketIOConfiguration;
    private readonly persistence: Persistence;
    public nsp: Namespace | null = null;

    constructor(io: Server, configuration?: YSocketIOConfiguration) {
        super();
        this.io = io;
        this.configuration = configuration;
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

        this.nsp.use(async (socket, next) => {
            if (!this.configuration?.initializeSocket) {
                return next();
            }
            try {
                const socketData = await this.configuration.initializeSocket(socket);
                setYSocketData(socket, socketData);
                return next();
            } catch {
                return next(new Error('Unauthorized'));
            }
        });

        this.nsp.on(ServerSocketIOEvent.CONNECTION, async (socket) => {
            const namespace = socket.nsp.name.replace(/\/yjs\|/, '') as TextBlockId;

            const doc = await this.initDocument(namespace, socket.nsp, this.configuration?.gcEnabled);
            this.initSyncListeners(socket, doc);
            this.initAwarenessListeners(socket, doc);
            this.initSocketListeners(socket, doc);
            this.startSynchronization(socket, doc);
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
    private async initDocument(textBlockId: TextBlockId, namespace: Namespace, gc: boolean = true): Promise<Document> {
        const doc =
            this._documents.get(textBlockId) ??
            new Document(textBlockId, namespace, {
                onUpdate: async (doc, update) => {
                    this.emit(YjsEvent.DOCUMENT_UPDATE, [doc, update]);
                    // Save document when updated
                    // await this.persistence.writeState(doc.name, doc);
                },
                onChangeAwareness: (doc, update) => this.emit(YjsEvent.AWARENESS_UPDATE, [doc, update]),
                onDestroy: async (doc) => {
                    this._documents.delete(doc.textBlockId);
                    this.emit(YjsEvent.DOCUMENT_DESTROY, [doc]);
                },
            });
        doc.gc = gc;
        if (!this._documents.has(textBlockId)) {
            // Load existing document data if available
            await this.persistence.bindState(textBlockId, doc);
            this._documents.set(textBlockId, doc);
            this.emit(YjsEvent.DOCUMENT_LOADED, [doc]);
        }
        return doc;
    }

    /**
     * This method sets up string persistence for Yjs documents.
     */
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

    /**
     * This function initializes the socket event listeners to synchronize document changes.
     *
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
     */
    private readonly initSyncListeners = (socket: Socket, doc: Document): void => {
        socket.on(YjsEvent.SYNC_STEP_1, (stateVector: Uint8Array, syncStep2: (update: Uint8Array) => void) => {
            const diffVec = Y.encodeStateAsUpdate(doc, new Uint8Array(stateVector));
            syncStep2(diffVec);
        });

        socket.on(YjsEvent.SYNC_UPDATE, (update: Uint8Array) => {
            Y.applyUpdate(doc, update, null);
        });
    };

    /**
     * This function initializes socket event listeners to synchronize awareness changes.
     *
     *  The awareness protocol is as follows:
     *  - A client emits the `awareness-update` event by sending the awareness update.
     *  - The server receives that event and applies the received update to the local awareness.
     *  - When an update is applied to awareness, the awareness "update" event will fire, which
     *    sends the update to clients connected to the document namespace.
     */
    private readonly initAwarenessListeners = (socket: Socket, doc: Document): void => {
        socket.on(YjsEvent.AWARENESS_UPDATE, (update: ArrayBuffer) => {
            AwarenessProtocol.applyAwarenessUpdate(doc.awareness, new Uint8Array(update), socket);
        });
    };

    /**
     *  This function initializes socket event listeners for general purposes.
     *
     *  When a client has been disconnected, check the clients connected to the document namespace,
     *  if no connection remains, emit the `all-document-connections-closed` event
     *  parameters and persist the document using string persistence.
     */
    private readonly initSocketListeners = (socket: Socket, doc: Document): void => {
        socket.on(ServerSocketIOEvent.DISCONNECT, async () => {
            if ((await socket.nsp.allSockets()).size === 0) {
                this.emit(YjsEvent.ALL_DOCUMENT_CONNECTIONS_CLOSED, [doc]);

                // Persist document state when all connections are closed and destroy the document
                await this.persistence.writeState(doc.textBlockId, doc);
                await doc.destroy();
            }
        });
    };

    /**
     * This function is called when a client connects and it emit the `sync-step-1` and `awareness-update`
     * events to the client to start the sync.
     */
    private readonly startSynchronization = (socket: Socket, doc: Document): void => {
        socket.emit(YjsEvent.SYNC_STEP_1, Y.encodeStateVector(doc), (update: Uint8Array) => {
            Y.applyUpdate(doc, new Uint8Array(update), this);
        });
        socket.emit(YjsEvent.AWARENESS_UPDATE, AwarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(doc.awareness.getStates().keys())));
    };
}
