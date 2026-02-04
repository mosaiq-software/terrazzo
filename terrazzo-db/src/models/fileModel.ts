import { UploadedFile } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const getFileModel = (sequelize: Sequelize): DbModel<UploadedFile> => {
    class FileModel extends Model<UploadedFile> {
        static associate(db: Db) {
            // define association here
        }
    }
    FileModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            base64: DataTypes.TEXT,
            fileName: DataTypes.STRING,
            mimeType: DataTypes.STRING,
            createdAt: DataTypes.BIGINT,
            createdByUserId: DataTypes.STRING,
        },
        { sequelize, timestamps: false, modelName: 'File' }
    );

    return FileModel;
};
