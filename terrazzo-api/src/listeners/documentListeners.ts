import { ClientSE, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { createNewDocument, getDocumentById, modifyDocument } from '@trz-api/controllers/documentController';
import { syncDirectoryContents } from '@trz-api/utils/broadcasters';
import { userCanEditModule, userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast, getSocketData, sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerDocumentListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.CREATE_DOCUMENT, async (data) => {
        if (!(await userCanEditModule(socket, data.parentId))) {
            throw new Error('User does not have permission to create a document in this module');
        }
        const socketData = getSocketData(socket);
        const document = await createNewDocument(data.title, data.parentId, socketData.user.user.id);
        await syncDirectoryContents(socket, document.parentId);
        return document;
    });

    sub(socket, ClientSE.GET_DOCUMENT, async (data) => {
        if (!(await userCanViewModule(socket, data))) {
            throw new Error('User does not have permission to view this document');
        }
        const document = await getDocumentById(data);
        return document;
    });

    sub(socket, ClientSE.UPDATE_DOCUMENT_FIELD, async (data) => {
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
        return undefined;
    });
};
