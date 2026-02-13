import { ModuleHeader, UID } from '@mosaiq/terrazzo-common';
import { CacheEntity, ModuleModel, getCached, invalidateCache } from '@mosaiq/terrazzo-db';

export const getModuleByIdDb = async (id: UID) => {
    return await getCached(CacheEntity.Module, id, async () => {
        const model = await ModuleModel.findByPk(id, {});
        return model?.toJSON();
    });
};

export const getModulesByParentIdDb = async (parentId: UID) => {
    const models = await ModuleModel.findAll({
        where: { parentId },
        order: [['order', 'ASC']],
    });
    return models.map((mdl) => mdl.toJSON());
};

export const getModulesByOrgIdDb = async (orgId: UID, options?: Partial<ModuleHeader>) => {
    const models = await ModuleModel.findAll({
        where: { orgId, ...options },
        order: [['order', 'ASC']],
    });
    return models.map((mdl) => mdl.toJSON());
};

export const createModuleDb = async (module: ModuleHeader) => {
    const model = await ModuleModel.create({ ...module });
    return model.toJSON();
};

export const updateModuleDb = async (id: UID, module: Partial<ModuleHeader>) => {
    const [updated] = await ModuleModel.update({ ...module }, { where: { id } });
    await invalidateCache(CacheEntity.Module, id);
    return updated;
};

export const deleteModuleDb = async (id: UID) => {
    const deleted = await ModuleModel.destroy({ where: { id } });
    await invalidateCache(CacheEntity.Module, id);
    return deleted;
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
