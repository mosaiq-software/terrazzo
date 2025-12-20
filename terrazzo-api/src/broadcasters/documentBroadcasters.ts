import { DocumentHeader, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { userCanViewDocument } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketUtils';

export const syncDocumentField = async (document: DocumentHeader) => {
    await broadcast({
        event: ServerSE.UPDATE_DOCUMENT_FIELD,
        toRoomIds: [getRoomCode(RoomType.DATA, document.id)],
        buildPayload: async (userId) => {
            if (!(await userCanViewDocument(userId, document.id))) {
                throw new Error('Insufficient permissions to view this document');
            }
            return document;
        },
    });
};
