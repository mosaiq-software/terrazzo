import { DocumentHeader, DocumentId, TrzModuleType, UID, UserId } from '@mosaiq/terrazzo-common';
import { createDocumentDb, DocumentModelType, getDocumentByIdDb, updateDocumentDb } from '@trz-api/persistence/documentPersistence';
import { getModuleByIdDb } from '@trz-api/persistence/modulePersistence';
import { createNewModule, updateModule } from './moduleController';
import { createTextBlockWithPlaintext } from './textBlockController';

export const createNewDocument = async (title: string, parentId: UID, createdByUserId: UserId) => {
    const docModule = await createNewModule(title, parentId, TrzModuleType.Document);
    const textBlock = await createTextBlockWithPlaintext();
    if (!textBlock) {
        throw new Error('Failed to create main text block for document');
    }

    const docModel: DocumentModelType = {
        id: docModule.id,
        textBlockId: textBlock.id,
        lastModifiedAt: Date.now(),
        lastModifiedByUserId: createdByUserId,
    };
    await createDocumentDb(docModel);
    const docHeader: DocumentHeader = {
        ...docModel,
        ...docModule,
        type: TrzModuleType.Document,
    };
    return docHeader;
};

export const getDocumentById = async (id: DocumentId): Promise<DocumentHeader | undefined> => {
    const docModule = await getModuleByIdDb(id);
    const docModel = await getDocumentByIdDb(id);
    if (!docModule || !docModel) {
        return undefined;
    }
    const document: DocumentHeader = {
        ...docModel,
        ...docModule,
        type: TrzModuleType.Document,
    };
    return document;
};

export const modifyDocument = async (id: DocumentId, updates: Partial<DocumentHeader>, byUserId: UserId): Promise<DocumentHeader | undefined> => {
    updates.lastModifiedAt = Date.now();
    updates.lastModifiedByUserId = byUserId;
    await updateDocumentDb(id, updates);
    await updateModule(id, updates);
    const updatedDocument = await getDocumentById(id);
    return updatedDocument;
};
