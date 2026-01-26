import { TextBlockId, UploadedFile } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class FileModel extends Model<UploadedFile> {}
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
    { sequelize, timestamps: false, tableName: 'Files' }
);

export const getFileByIdDb = async (id: TextBlockId) => {
    const model = await FileModel.findByPk(id);
    return model?.toJSON();
};

export const createFileDb = async (file: UploadedFile) => {
    const model = await FileModel.create({ ...file });
    return model.toJSON();
};

export const writeFileDb = async (id: TextBlockId, base64: string, fileName: string, mimeType: string) => {
    const [updated] = await FileModel.update({ base64, fileName, mimeType }, { where: { id } });
    return updated;
};

export const deleteFileDb = async (id: TextBlockId) => {
    const deleted = await FileModel.destroy({ where: { id } });
    return deleted;
};
