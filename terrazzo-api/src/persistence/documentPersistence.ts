import { DocumentId } from '@mosaiq/terrazzo-common';
import { CacheEntity, DocumentModel, getCached, invalidateCache } from '@mosaiq/terrazzo-db';
import { DocumentModelType } from '@mosaiq/terrazzo-db/dist/models/documentModel';

export const getDocumentByIdDb = async (id: DocumentId) => {
    return await getCached(CacheEntity.Document, id, async () => {
        const model = await DocumentModel.findByPk(id, {});
        return model?.toJSON();
    });
};

export const createDocumentDb = async (document: DocumentModelType) => {
    const model = await DocumentModel.create({ ...document });
    return model.toJSON();
};

export const updateDocumentDb = async (id: DocumentId, document: Partial<DocumentModelType>) => {
    const [updated] = await DocumentModel.update(
        {
            ...document,
        },
        { where: { id: id } }
    );
    await invalidateCache(CacheEntity.Document, id);
    return updated;
};
