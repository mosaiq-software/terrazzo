import { OrganizationHeader, OrganizationId } from '@mosaiq/terrazzo-common/types';
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
    { sequelize }
);

export const getOrgById = async (id: OrganizationId) => {
    const model = await OrgModel.findByPk(id, {
        attributes: {
            exclude: ['updatedAt'],
        },
    });
    return model?.toJSON();
};

export const createOrg = async (org: OrganizationHeader) => {
    const model = await OrgModel.create({
        id: org.id,
        name: org.name,
        createdAt: org.createdAt,
        logoUrl: org.logoUrl,
        description: org.description,
    });
    return model.toJSON();
};

export const updateOrg = async (org: OrganizationHeader) => {
    const [updated] = await OrgModel.update(
        {
            name: org.name,
            logoUrl: org.logoUrl,
            description: org.description,
        },
        { where: { id: org.id } }
    );
    return updated;
};
