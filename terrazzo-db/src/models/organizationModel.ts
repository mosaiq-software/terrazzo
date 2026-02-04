import { OrganizationHeader } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const getOrganizationModel = (sequelize: Sequelize): DbModel<OrganizationHeader> => {
    class OrganizationModel extends Model<OrganizationHeader> {
        static associate(db: Db) {
            // define association here
        }
    }
    OrganizationModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            createdAt: DataTypes.INTEGER,
            logoUrl: DataTypes.STRING,
            description: DataTypes.TEXT,
            ownerId: DataTypes.STRING,
        },
        { sequelize, timestamps: false, modelName: 'Organization' }
    );

    return OrganizationModel;
};
