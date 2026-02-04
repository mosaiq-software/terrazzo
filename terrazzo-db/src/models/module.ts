import { ModuleHeader } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const ModuleModel = (sequelize: Sequelize): DbModel => {
    class ModuleModel extends Model<ModuleHeader> {
        static associate(db: Db) {
            // define association here
        }
    }
    ModuleModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            parentId: DataTypes.STRING,
            name: DataTypes.STRING,
            type: DataTypes.STRING,
            order: DataTypes.INTEGER,
            archived: DataTypes.BOOLEAN,
            createdAt: DataTypes.INTEGER,
            orgId: DataTypes.STRING,
            desiredPermissions: DataTypes.JSON,
            effectivePermissions: DataTypes.JSON,
            public: DataTypes.BOOLEAN,
        },
        { sequelize, timestamps: false, modelName: 'Module' }
    );

    return ModuleModel;
};
