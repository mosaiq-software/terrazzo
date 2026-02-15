import { DocumentHeader, DocumentId, UserId } from '@mosaiq/terrazzo-common';
import { syncDirectoryContents, syncDocumentField } from '@trz-api/broadcasters';
import { updateDocumentDb } from '@trz-api/persistence/documentPersistence';
import { updateModule } from './moduleController';

export const modifyDocument = async (
    id: DocumentId,
    updates: Partial<DocumentHeader>,
    byUserId: UserId
): Promise<DocumentHeader | undefined> => {
    updates.lastModifiedAt = Date.now();
    updates.lastModifiedByUserId = byUserId;
    await updateDocumentDb(id, updates);
    await updateModule(id, updates);
    const updatedDocument = await getDocumentById(id);
    if (!updatedDocument) {
        return undefined;
    }
    await syncDocumentField(updatedDocument);
    await syncDirectoryContents(updatedDocument.parentId);
    return updatedDocument;
};
