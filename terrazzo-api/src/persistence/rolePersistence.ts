import { OrganizationId, Role, RoleId } from '@mosaiq/terrazzo-common/types';
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
        defaultPermissions: DataTypes.JSON,
    },
    { sequelize }
);

export const getRoleByIdDb = async (id: RoleId) => {
    const model = await RoleModel.findByPk(id);
    return model?.toJSON();
};

export const getRolesByOrgIdDb = async (orgId: OrganizationId) => {
    const models = await RoleModel.findAll({ where: { orgId } });
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
