import { DirectoryHeader, DirectoryId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class DirectoryModel extends Model {}
DirectoryModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        parentId: DataTypes.STRING,
        name: DataTypes.STRING,
        archived: DataTypes.BOOLEAN,
        createdAt: DataTypes.INTEGER,
    },
    { sequelize, timestamps: false }
);

export const getDirectoryByIdDb = async (id: DirectoryId) => {
    return (await DirectoryModel.findByPk(id, {}))?.toJSON() as DirectoryHeader | undefined;
};

export const getDirectoriesByParentIdDb = async (parentId: DirectoryId | null) => {
    return (
        await DirectoryModel.findAll({
            where: { parentId },
        })
    ).map((doc) => doc.toJSON()) as DirectoryHeader[];
};

export const createDirectoryDb = async (document: DirectoryHeader) => {
    return await DirectoryModel.create({ ...document });
};

export const updateDirectoryDb = async (id: DirectoryId, document: Partial<DirectoryHeader>) => {
    return await DirectoryModel.update(
        {
            ...document,
        },
        { where: { id: id } }
    );
};
