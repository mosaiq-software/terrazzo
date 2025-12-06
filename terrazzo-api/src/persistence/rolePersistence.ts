import { OrganizationId, Role, RoleId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class RoleModel extends Model<Role> {}
RoleModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        orgId: DataTypes.STRING,
        name: DataTypes.STRING,
        color: DataTypes.STRING,
        order: DataTypes.INTEGER,
        defaultPermissions: DataTypes.JSON,
    },
    { sequelize }
);

export const getRoleByIdDb = async (id: RoleId) => {
    const model = await RoleModel.findByPk(id);
    return model?.toJSON();
};

export const getRolesByOrgIdDb = async (orgId: OrganizationId) => {
    const models = await RoleModel.findAll({ where: { orgId }, order: [['order', 'ASC']] });
    return models.map((role) => role.toJSON());
};

export const createRoleOnOrgDb = async (role: Role) => {
    const model = await RoleModel.create({ ...role });
    return model.toJSON();
};

export const updateRoleDb = async (role: Partial<Role> & { id: RoleId }) => {
    const [updated] = await RoleModel.update({ ...role }, { where: { id: role.id } });
    return updated;
};

export const deleteRoleDb = async (id: RoleId) => {
    const deleted = await RoleModel.destroy({ where: { id } });
    return deleted;
};

export const reorderRolesDb = async (orgId: OrganizationId, orderedRoleIds: RoleId[]) => {
    const transaction = await sequelize.transaction();
    try {
        for (let index = 0; index < orderedRoleIds.length; index++) {
            const roleId = orderedRoleIds[index];
            await RoleModel.update({ order: index }, { where: { id: roleId, orgId }, transaction });
        }
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
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
