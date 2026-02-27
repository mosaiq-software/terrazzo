import { OrganizationId, Role, RoleId } from '@mosaiq/terrazzo-common';
import { CacheEntity, RoleModel, getCached, invalidateCache } from '@mosaiq/terrazzo-db';

export const getRoleByIdDb = async (id: RoleId) => {
    return await getCached(CacheEntity.Role, id, async () => {
        const model = await RoleModel.findByPk(id);
        return model?.toJSON();
    });
};

export const getRolesByOrgIdDb = async (orgId: OrganizationId) => {
    const models = await RoleModel.findAll({ where: { orgId }, order: [['order', 'ASC']] });
    return models.map((role) => role.toJSON());
};

export const getRoleIdsByOrgIdDb = async (orgId: OrganizationId): Promise<RoleId[]> => {
    const models = await RoleModel.findAll({ attributes: ['id'], where: { orgId }, order: [['order', 'ASC']] });
    return models.map((role) => role.toJSON().id);
};

export const createRoleOnOrgDb = async (role: Role) => {
    const model = await RoleModel.create({ ...role });
    return model.toJSON();
};

export const updateRoleDb = async (id: RoleId, update: Partial<Role>) => {
    const [updated] = await RoleModel.update({ ...update }, { where: { id } });
    await invalidateCache(CacheEntity.Role, id);
    return updated;
};

export const getNextRoleOrderDb = async (orgId: OrganizationId) => {
    const maxOrderRole = await RoleModel.findOne({
        where: { orgId },
        order: [['order', 'DESC']],
    });
    const role = maxOrderRole?.toJSON();
    if (!role) {
        return 0;
    }
    return role.order + 1;
};
