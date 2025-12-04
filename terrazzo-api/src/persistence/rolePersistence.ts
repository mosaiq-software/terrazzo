import { OrganizationId, Role, RoleId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class RoleModel extends Model {}
RoleModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        orgId: DataTypes.STRING,
        name: DataTypes.STRING,
        color: DataTypes.STRING,
    },
    { sequelize }
);

export const getRoleByIdDb = async (id: RoleId) => {
    return (await RoleModel.findByPk(id))?.toJSON() as Role | null;
};

export const getRolesByOrgIdDb = async (orgId: OrganizationId) => {
    return (await RoleModel.findAll({ where: { orgId } })).map((role) => role.toJSON()) as Role[];
};

export const createRoleOnOrgDb = async (role: Role) => {
    await RoleModel.create({ ...role });
};

export const updateRoleDb = async (role: Partial<Role> & { id: RoleId }) => {
    await RoleModel.update(
        {
            name: role.name,
            color: role.color,
        },
        { where: { id: role.id } }
    );
};

export const deleteRoleDb = async (id: RoleId) => {
    await RoleModel.destroy({ where: { id } });
};
