import { ModuleDataMap, ModuleHeader, ModuleId, OrganizationId, TrzModule } from '@mosaiq/terrazzo-common';
import { CacheEntity, ModuleModel, getCached, invalidateCache, sequelize } from '@mosaiq/terrazzo-db';

export const getModuleByIdDb = async (id: ModuleId) => {
    return await getCached(CacheEntity.Module, id, async () => {
        const model = await ModuleModel.findByPk(id, {});
        return model?.toJSON();
    });
};

export const getModulesByParentIdDb = async (parentId: ModuleId) => {
    const models = await ModuleModel.findAll({
        where: { parentId },
        order: [['order', 'ASC']],
    });
    return models.map((mdl) => mdl.toJSON());
};

export const getModulesByOrgIdDb = async (orgId: OrganizationId, options?: Partial<Omit<ModuleHeader, 'data'>>) => {
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

export const updateModuleDb = async (id: ModuleId, module: Partial<ModuleHeader>) => {
    const [updated] = await ModuleModel.update({ ...module }, { where: { id } });
    await invalidateCache(CacheEntity.Module, id);
    return updated;
};

export const deleteModuleDb = async (id: ModuleId) => {
    const deleted = await ModuleModel.destroy({ where: { id } });
    await invalidateCache(CacheEntity.Module, id);
    return deleted;
};

export const getNextModuleOrderInParentDb = async (parentId: ModuleId) => {
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

export const updateModuleDataDb = async <T extends TrzModule>(id: ModuleId, type: T, data: ModuleDataMap[T]) => {
    const transaction = await sequelize.transaction();
    try {
        const moduleModel = await ModuleModel.findByPk(id, { transaction });
        if (!moduleModel) {
            throw new Error('Module not found');
        }
        const module = moduleModel.toJSON();
        if (module.type !== type) {
            throw new Error(`Module type mismatch. Expected ${module.type}, got ${type}`);
        }
        const newData = { ...module.data, ...data };
        await moduleModel.update({ data: newData }, { transaction });
        await invalidateCache(CacheEntity.Module, id);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
