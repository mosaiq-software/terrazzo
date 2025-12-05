import { DirectoryId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

export interface DirectoryModelType {
    id: DirectoryId;
}
class DirectoryModel extends Model<DirectoryModelType> {}
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
    const model = await DirectoryModel.findByPk(id, {});
    return model?.toJSON();
};

export const createDirectoryDb = async (document: DirectoryModelType) => {
    const model = await DirectoryModel.create({ ...document });
    return model.toJSON();
};

export const updateDirectoryDb = async (id: DirectoryId, document: Partial<DirectoryModelType>) => {
    const [updated] = await DirectoryModel.update({ ...document }, { where: { id: id } });
    return updated;
};
