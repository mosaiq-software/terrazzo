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
        permissionLevel: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
    },
    { sequelize, timestamps: false }
);

export const getOrganizationMembership = async (userId: UserId, orgId: OrganizationId) => {
    const model = await OrganizationMembershipModel.findOne({ where: { userId, orgId } });
    return model?.toJSON();
};

export const getOrganizationMembershipsForUser = async (userId: UserId) => {
    const models = await OrganizationMembershipModel.findAll({ where: { userId } });
    return models.map((membership) => membership.toJSON());
};

export const getOrganizationMembershipsForOrg = async (orgId: OrganizationId) => {
    const models = await OrganizationMembershipModel.findAll({ where: { orgId } });
    return models.map((membership) => membership.toJSON());
};

export const upsertOrganizationMembership = async (membershipRecord: MembershipRecord) => {
    await OrganizationMembershipModel.upsert({ ...membershipRecord });
};

export const updateOrganizationMembership = async (membershipRecord: MembershipRecord) => {
    const [updated] = await OrganizationMembershipModel.update(
        {
            permissionLevel: membershipRecord.permissionLevel,
        },
        { where: { userId: membershipRecord.userId, orgId: membershipRecord.orgId } }
    );
    return updated;
};

export const deleteOrganizationMembership = async (userId: UserId, orgId: OrganizationId) => {
    const deleted = await OrganizationMembershipModel.destroy({ where: { userId, orgId } });
    return deleted;
};
