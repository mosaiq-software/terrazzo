import { DocumentId, TextBlockId, UserId } from '@mosaiq/terrazzo-common';
import { DocumentModel } from '@mosaiq/terrazzo-db';

export interface DocumentModelType {
    id: DocumentId;
    textBlockId: TextBlockId;
    lastModifiedAt: number;
    lastModifiedByUserId: UserId;
}

export const getDocumentByIdDb = async (id: DocumentId) => {
    const model = await DocumentModel.findByPk(id, {});
    return model?.toJSON();
};

export const getDocumentsByTextBlockIdDb = async (textBlockId: TextBlockId) => {
    const models = await DocumentModel.findAll({
        where: { textBlockId },
    });
    return models.map((doc) => doc.toJSON());
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
    return updated;
};
