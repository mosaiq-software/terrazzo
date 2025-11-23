import { ModuleHeader, UID } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class ModuleModel extends Model {}
ModuleModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        parentId: DataTypes.STRING,
        name: DataTypes.STRING,
        archived: DataTypes.BOOLEAN,
        createdAt: DataTypes.INTEGER,
        orgId: DataTypes.STRING,
        type: DataTypes.STRING,
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

export const getModuleByIdDb = async (id: UID) => {
    return (await ModuleModel.findByPk(id, {}))?.toJSON() as ModuleHeader | undefined;
};

export const getModulesByParentIdDb = async (parentId: UID | null) => {
    return (
        await ModuleModel.findAll({
            where: { parentId },
        })
    ).map((mdl) => mdl.toJSON()) as ModuleHeader[];
};

export const createModuleDb = async (module: ModuleHeader) => {
    return await ModuleModel.create({ ...module });
};

export const updateModuleDb = async (id: UID, module: Partial<ModuleHeader>) => {
    return await ModuleModel.update(
        {
            ...module,
        },
        { where: { id: id } }
    );
};
