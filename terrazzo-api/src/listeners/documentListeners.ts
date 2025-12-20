import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncDirectoryContents, syncDocumentField } from '@trz-api/broadcasters';
import { createNewDocument, getDocumentById, modifyDocument } from '@trz-api/controllers/documentController';
import { userCanCreateDocument, userCanEditDocument, userCanViewDocument } from '@trz-api/utils/permissions';
import { getSocketData, subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerDocumentListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.CREATE_DOCUMENT, async (data) => {
        if (!(await userCanCreateDocument(socket, data.parentId))) {
            throw new Error('User does not have permission to create a document in this module');
        }
        const socketData = getSocketData(socket);
        if (!socketData.user?.userId) {
            throw new Error('User not authenticated');
        }
        const document = await createNewDocument(data.title, data.parentId, socketData.user.userId);
        await syncDirectoryContents(document.parentId);
        return document;
    });

    subscribe(socket, ClientSE.GET_DOCUMENT, async (data) => {
        if (!(await userCanViewDocument(socket, data))) {
            throw new Error('User does not have permission to view this document');
        }
        const document = await getDocumentById(data);
        return document;
    });

    subscribe(socket, ClientSE.UPDATE_DOCUMENT_FIELD, async (data) => {
        if (!(await userCanEditDocument(socket, data.id))) {
            throw new Error('User does not have permission to edit this document');
        }
        const socketData = getSocketData(socket);
        if (!socketData.user?.userId) {
            throw new Error('User not authenticated');
        }
        const updatedDocument = await modifyDocument(data.id, data, socketData.user.userId);
        if (!updatedDocument) {
            throw new Error('No document found');
        }

        await syncDocumentField(updatedDocument);
        await syncDirectoryContents(updatedDocument.parentId);
        return undefined;
    });
};
