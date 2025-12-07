import { ClientSE, ClientSEPayload, ClientSEReply, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { createNewDocument, getDocumentById, modifyDocument } from '@trz-api/controllers/documentController';
import { syncDirectoryContents } from '@trz-api/utils/broadcasters';
import { userCanEditModule, userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast, getSocketData } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerDocumentListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.CREATE_DOCUMENT, async (data: ClientSEPayload[ClientSE.CREATE_DOCUMENT], reply: ClientSEReply<ClientSE.CREATE_DOCUMENT>) => {
        try {
            if (!data) {
                throw new Error('No document data provided');
            }
            if (!(await userCanEditModule(socket, data.parentId))) {
                throw new Error('User does not have permission to create a document in this module');
            }
            const socketData = getSocketData(socket);
            const document = await createNewDocument(data.title, data.parentId, socketData.user.user.id);
            await syncDirectoryContents(socket, document.parentId);
            reply(document);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_DOCUMENT, async (data: ClientSEPayload[ClientSE.GET_DOCUMENT], reply: ClientSEReply<ClientSE.GET_DOCUMENT>) => {
        try {
            if (!data) {
                throw new Error('No document id provided');
            }
            if (!(await userCanViewModule(socket, data))) {
                throw new Error('User does not have permission to view this document');
            }
            const document = await getDocumentById(data);
            reply(document);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_DOCUMENT_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_DOCUMENT_FIELD], reply: ClientSEReply<ClientSE.UPDATE_DOCUMENT_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No document data provided');
            }
            if (!(await userCanEditModule(socket, data.id))) {
                throw new Error('User does not have permission to edit this document');
            }
            const socketData = getSocketData(socket);
            const updatedDocument = await modifyDocument(data.id, data, socketData.user.user.id);
            if (!updatedDocument) {
                throw new Error('No document found');
            }
            broadcast(socket, ServerSE.UPDATE_DOCUMENT_FIELD, updatedDocument, [getRoomCode(RoomType.DATA, data.id)]);
            await syncDirectoryContents(socket, updatedDocument.parentId);
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
