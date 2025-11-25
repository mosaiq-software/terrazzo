import { DocumentId, TextBlockId, UserId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

export interface DocumentModelType {
    id: DocumentId;
    textBlockId: TextBlockId;
    lastModifiedAt: number;
    lastModifiedByUserId: UserId;
}
class DocumentModel extends Model {}
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
    return (await DocumentModel.findByPk(id, {}))?.toJSON() as DocumentModelType | undefined;
};

export const createDocumentDb = async (document: DocumentModelType) => {
    await DocumentModel.create({ ...document });
};

export const updateDocumentDb = async (id: DocumentId, document: Partial<DocumentModelType>) => {
    await DocumentModel.update(
        {
            ...document,
        },
        { where: { id: id } }
    );
};

export const getDocumentByTextBlockIdDb = async (textBlockId: string) => {
    return (
        await DocumentModel.findOne({
            where: { textBlockId },
        })
    )?.toJSON() as DocumentModelType | undefined;
};
