import { ModuleHeader, TrzModuleType } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type ModuleModelType = ModuleHeader<TrzModuleType>;

export const getModuleModel = (sequelize: Sequelize): DbModel<ModuleModelType> => {
    class ModuleModel extends Model<ModuleModelType> {
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
            data: DataTypes.JSON,
        },
        { sequelize, timestamps: false, modelName: 'Module' }
    );

    return ModuleModel;
};
