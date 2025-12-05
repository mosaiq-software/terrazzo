import { DocumentId, TextBlockId, UserId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

export interface DocumentModelType {
    id: DocumentId;
    textBlockId: TextBlockId;
    lastModifiedAt: number;
    lastModifiedByUserId: UserId;
}
class DocumentModel extends Model<DocumentModelType> {}
DocumentModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        textBlockId: DataTypes.STRING,
        lastModifiedAt: DataTypes.INTEGER,
        lastModifiedByUserId: DataTypes.STRING,
    },
    { sequelize, timestamps: false }
);

export const getDocumentByIdDb = async (id: DocumentId) => {
    const model = await DocumentModel.findByPk(id, {});
    return model?.toJSON();
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

export const getDocumentByTextBlockIdDb = async (textBlockId: string) => {
    const model = await DocumentModel.findOne({
        where: { textBlockId },
    });
    return model?.toJSON();
};
