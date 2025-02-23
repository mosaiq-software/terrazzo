import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { Organization, OrganizationHeader, OrganizationId } from '@mosaiq/terrazzo-common/types';

class OrgModel extends Model {}
OrgModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: DataTypes.STRING,
    archived: DataTypes.BOOLEAN,
    createdAt: DataTypes.INTEGER,
    logoUrl: DataTypes.STRING,
    personal: DataTypes.BOOLEAN,
}, { sequelize, modelName: 'organizationModel' });

sequelize.sync();

export const getOrgById = async (id: OrganizationId) => {
    return (await OrgModel.findByPk(id, {
        attributes:{
            exclude:['updatedAt']
        }}))?.toJSON() as OrganizationHeader | undefined;
}

export const createOrg = async (org: OrganizationHeader) => {
    return await OrgModel.create({
        id: org.id,
        name: org.name,
        archived: false,
        createdAt: org.createdAt,
        logoUrl: org.logoUrl,
        personal: org.isPersonalOrg,
    });
}

export const updateOrg = async (org: OrganizationHeader) => {
    return await OrgModel.update({
        name: org.name,
        archived: org.archived,
        logoUrl: org.logoUrl,
    }, { where: { id: org.id } });
};