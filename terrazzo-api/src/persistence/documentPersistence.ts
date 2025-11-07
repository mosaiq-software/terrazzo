import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DocumentHeader, DocumentId } from '@mosaiq/terrazzo-common/types';

class DocumentModel extends Model {}
DocumentModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        parentId: DataTypes.STRING,
        title: DataTypes.STRING,
        textBlockId: DataTypes.STRING,
        archived: DataTypes.BOOLEAN,
        createdAt: DataTypes.INTEGER,
        lastModifiedAt: DataTypes.INTEGER,
        lastModifiedByUserId: DataTypes.STRING,
    },
    { sequelize, timestamps: false }
);

export const getDocumentById = async (id: DocumentId) => {
    return (await DocumentModel.findByPk(id, {}))?.toJSON() as DocumentHeader | undefined;
};

export const getProjectsByParentId = async (parentId: DocumentId) => {
    return (
        await DocumentModel.findAll({
            where: { parentId },
        })
    ).map((doc) => doc.toJSON()) as DocumentHeader[];
};

export const createDocument = async (document: DocumentHeader) => {
    return await DocumentModel.create({ ...document });
};

export const updateDocument = async (id: DocumentId, document: Partial<DocumentHeader>) => {
    return await DocumentModel.update(
        {
            ...document,
        },
        { where: { id: id } }
    );
};

export const getDocumentByTextBlockId = async (textBlockId: string) => {
    return (
        await DocumentModel.findOne({
            where: { textBlockId },
        })
    )?.toJSON() as DocumentHeader | undefined;
};
