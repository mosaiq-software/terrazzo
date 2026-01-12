import { ClientSE, DocumentHeader, DocumentId, UID } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getDocument = async (sockCtx: SocketContextType, documentId: DocumentId) => {
    return await sockCtx.emit(ClientSE.GET_DOCUMENT, documentId);
};

export const createDocument = async (sockCtx: SocketContextType, title: string, parentId: UID) => {
    return await sockCtx.emit(ClientSE.CREATE_DOCUMENT, { parentId, title });
};

export const updateDocumentMetadata = async (
    sockCtx: SocketContextType,
    documentId: DocumentId,
    partial: Partial<DocumentHeader>
) => {
    await sockCtx.emit(ClientSE.UPDATE_DOCUMENT_FIELD, { ...partial, id: documentId });
};
