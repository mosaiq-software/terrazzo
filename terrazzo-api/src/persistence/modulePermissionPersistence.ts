import { PermissionRecord } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class ModulePermissionModel extends Model {}
ModulePermissionModel.init(
    {
        moduleId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        orgId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        anyonePermissionLevel: {
            type: DataTypes.TINYINT,
            allowNull: true,
        },
        orgPermissionLevel: {
            type: DataTypes.TINYINT,
            allowNull: true,
        },
        userPermissionLevels: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    },
    { sequelize, timestamps: false }
);

export const getModulePermissionByModuleId = async (moduleId: string) => {
    return (await ModulePermissionModel.findByPk(moduleId))?.toJSON() as PermissionRecord | null;
};

export const upsertModulePermission = async (permissionRecord: PermissionRecord) => {
    await ModulePermissionModel.upsert({ ...permissionRecord });
};
