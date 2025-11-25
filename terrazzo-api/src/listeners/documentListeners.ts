import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { createNewDocument, getDocumentById, modifyDocument } from '@trz-api/controllers/documentController';
import { broadcast, broadcastUniqueUpdatesForUpdatedModule, getSocketData } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerDocumentListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.CREATE_DOCUMENT, async (data: ClientSEPayload[ClientSE.CREATE_DOCUMENT], reply: ClientSEReply<ClientSE.CREATE_DOCUMENT>) => {
        try {
            const socketData = getSocketData(socket);
            const document = await createNewDocument(data.title, data.parentId, socketData.user.user.id);
            await broadcastUniqueUpdatesForUpdatedModule(socket, io, document.id);
            reply(document);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_DOCUMENT, async (data: ClientSEPayload[ClientSE.GET_DOCUMENT], reply: ClientSEReply<ClientSE.GET_DOCUMENT>) => {
        try {
            const document = await getDocumentById(data);
            reply(document);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_DOCUMENT_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_DOCUMENT_FIELD], reply: ClientSEReply<ClientSE.UPDATE_DOCUMENT_FIELD>) => {
        try {
            const socketData = getSocketData(socket);
            const updatedDocument = await modifyDocument(data.id, data, socketData.user.user.id);
            if (!updatedDocument) {
                throw new Error('No document found');
            }
            broadcast<ServerSE.UPDATE_DOCUMENT_FIELD>(socket, ServerSE.UPDATE_DOCUMENT_FIELD, updatedDocument, [getRoomCode(RoomType.DATA, data.id)]);
            await broadcastUniqueUpdatesForUpdatedModule(socket, io, data.id);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
