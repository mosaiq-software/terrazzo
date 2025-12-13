import { OrganizationHeader, OrganizationId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class OrgModel extends Model<OrganizationHeader> {}
OrgModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: DataTypes.STRING,
        createdAt: DataTypes.INTEGER,
        logoUrl: DataTypes.STRING,
        description: DataTypes.TEXT,
    },
    { sequelize, timestamps: false }
);

export const getOrgByIdDb = async (id: OrganizationId) => {
    const model = await OrgModel.findByPk(id);
    return model?.toJSON();
};

export const createOrgDb = async (org: OrganizationHeader) => {
    const model = await OrgModel.create({ ...org });
    return model.toJSON();
};

export const updateOrgDb = async (org: OrganizationHeader) => {
    const [updated] = await OrgModel.update({ ...org }, { where: { id: org.id } });
    return updated;
};
