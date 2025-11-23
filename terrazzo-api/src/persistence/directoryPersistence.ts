import { DirectoryId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

export interface DirectoryModelType {
    id: DirectoryId;
}
class DirectoryModel extends Model {}
DirectoryModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
    },
    { sequelize, timestamps: false }
);

export const getDirectoryByIdDb = async (id: DirectoryId) => {
    return (await DirectoryModel.findByPk(id, {}))?.toJSON() as DirectoryModelType | undefined;
};

export const createDirectoryDb = async (document: DirectoryModelType) => {
    return await DirectoryModel.create({ ...document });
};

export const updateDirectoryDb = async (id: DirectoryId, document: Partial<DirectoryModelType>) => {
    return await DirectoryModel.update({ ...document }, { where: { id: id } });
};
