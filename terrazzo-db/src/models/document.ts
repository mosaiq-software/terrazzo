import { DocumentId, TextBlockId, UserId } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export interface DocumentModelType {
    id: DocumentId;
    textBlockId: TextBlockId;
    lastModifiedAt: number;
    lastModifiedByUserId: UserId;
}

export const DocumentModel = (sequelize: Sequelize): DbModel => {
    class DocumentModel extends Model<DocumentModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
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
        { sequelize, timestamps: false, modelName: 'Document' }
    );

    return DocumentModel;
};
