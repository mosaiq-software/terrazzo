import { DocumentHeader, DocumentId, UID, UserId } from '@mosaiq/terrazzo-common/types';
import { createTextBlockWithPlaintext } from './textBlockController';
import { createDocument, getDocumentById, getProjectsByParentId, updateDocument } from '@trz-api/persistence/documentPersistence';

export const createNewDocument = async (title: string, parentId: UID, createdByUserId: UserId) => {
    const docId: DocumentId = crypto.randomUUID();
    const timestamp = Date.now();

    const textBlock = await createTextBlockWithPlaintext();
    if (!textBlock) {
        throw new Error('Failed to create main text block for document');
    }

    const newDoc: DocumentHeader = {
        id: docId,
        parentId,
        title,
        textBlockId: textBlock.id,
        archived: false,
        createdAt: timestamp,
        lastModifiedAt: timestamp,
        lastModifiedByUserId: createdByUserId,
    };

    await createDocument(newDoc);
    return newDoc;
};

export const getAllDocumentsForParent = async (parentId: UID) => {
    const documents = await getProjectsByParentId(parentId);
    return documents;
};

export const modifyDocument = async (id: DocumentId, updates: Partial<DocumentHeader>, byUserId: UserId) => {
    updates.lastModifiedAt = Date.now();
    updates.lastModifiedByUserId = byUserId;
    await updateDocument(id, updates);
    const updatedDocument = await getDocumentById(id);
    return updatedDocument;
};
