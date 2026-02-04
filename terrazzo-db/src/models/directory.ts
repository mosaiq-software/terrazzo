import { DirectoryId } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export interface DirectoryModelType {
    id: DirectoryId;
}

export const getDirectoryModel = (sequelize: Sequelize): DbModel<DirectoryModelType> => {
    class DirectoryModel extends Model<DirectoryModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
    DirectoryModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
        },
        { sequelize, timestamps: false, modelName: 'Directory' }
    );

    return DirectoryModel;
};
