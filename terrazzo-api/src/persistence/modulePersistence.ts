import { ModuleHeader, UID } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class ModuleModel extends Model<ModuleHeader> {}
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
    const model = await ModuleModel.findByPk(id, {});
    return model?.toJSON();
};

export const getModulesByParentIdDb = async (parentId: UID | undefined) => {
    const models = await ModuleModel.findAll({
        where: { parentId },
    });
    return models.map((mdl) => mdl.toJSON());
};

export const getModulesByOrgIdDb = async (orgId: UID) => {
    const models = await ModuleModel.findAll({
        where: { orgId },
    });
    return models.map((mdl) => mdl.toJSON());
};

export const createModuleDb = async (module: ModuleHeader) => {
    const model = await ModuleModel.create({ ...module });
    return model.toJSON();
};

export const updateModuleDb = async (id: UID, module: Partial<ModuleHeader>) => {
    const [updated] = await ModuleModel.update(
        {
            ...module,
        },
        { where: { id: id } }
    );
    return updated;
};
