import { ModuleHeader, UID } from '@mosaiq/terrazzo-common';
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
        type: DataTypes.STRING,
        order: DataTypes.INTEGER,
        archived: DataTypes.BOOLEAN,
        createdAt: DataTypes.INTEGER,
        orgId: DataTypes.STRING,
        desiredPermissions: DataTypes.JSON,
        effectivePermissions: DataTypes.JSON,
    },
    { sequelize, timestamps: false }
);

export const getModuleByIdDb = async (id: UID) => {
    const model = await ModuleModel.findByPk(id, {});
    return model?.toJSON();
};

export const getModulesByParentIdDb = async (parentId: UID) => {
    const models = await ModuleModel.findAll({
        where: { parentId },
        order: [['order', 'ASC']],
    });
    return models.map((mdl) => mdl.toJSON());
};

export const getModulesByOrgIdDb = async (orgId: UID) => {
    const models = await ModuleModel.findAll({
        where: { orgId },
        order: [['order', 'ASC']],
    });
    return models.map((mdl) => mdl.toJSON());
};

export const createModuleDb = async (module: ModuleHeader) => {
    const model = await ModuleModel.create({ ...module });
    return model.toJSON();
};

export const updateModuleDb = async (id: UID, module: Partial<ModuleHeader>) => {
    const [updated] = await ModuleModel.update({ ...module }, { where: { id: id } });
    return updated;
};

export const getNextModuleOrderInParentDb = async (parentId: UID) => {
    const maxOrderModule = await ModuleModel.findOne({
        where: { parentId },
        order: [['order', 'DESC']],
    });
    const module = maxOrderModule?.toJSON();
    if (!module) {
        return 0;
    }
    return module.order + 1;
};
