import { MembershipRecord, OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class OrganizationMembershipModel extends Model<MembershipRecord> {}
OrganizationMembershipModel.init(
    {
        userId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        orgId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        joinedAt: {
            type: DataTypes.NUMBER,
            allowNull: false,
        },
    },
    { sequelize, timestamps: false }
);

export const getOrganizationMembershipDb = async (userId: UserId, orgId: OrganizationId) => {
    const model = await OrganizationMembershipModel.findOne({ where: { userId, orgId } });
    return model?.toJSON();
};

export const getOrganizationMembershipsForUserDb = async (userId: UserId) => {
    const models = await OrganizationMembershipModel.findAll({ where: { userId } });
    return models.map((membership) => membership.toJSON());
};

export const getOrganizationMembershipsForOrgDb = async (orgId: OrganizationId) => {
    const models = await OrganizationMembershipModel.findAll({ where: { orgId } });
    return models.map((membership) => membership.toJSON());
};

export const createOrganizationMembershipDb = async (membershipRecord: MembershipRecord) => {
    await OrganizationMembershipModel.create({ ...membershipRecord });
};

export const deleteOrganizationMembershipDb = async (userId: UserId, orgId: OrganizationId) => {
    const deleted = await OrganizationMembershipModel.destroy({ where: { userId, orgId } });
    return deleted;
};
