import { MembershipRecord, OrganizationId, UserId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class OrganizationMembershipModel extends Model {}
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
    return (await OrganizationMembershipModel.findOne({ where: { userId, orgId } }))?.toJSON() as MembershipRecord | null;
};

export const getOrganizationMembershipsForUser = async (userId: UserId) => {
    return (await OrganizationMembershipModel.findAll({ where: { userId } })).map((membership) => membership.toJSON()) as MembershipRecord[];
};

export const getOrganizationMembershipsForOrg = async (orgId: OrganizationId) => {
    return (await OrganizationMembershipModel.findAll({ where: { orgId } })).map((membership) => membership.toJSON()) as MembershipRecord[];
};

export const upsertOrganizationMembership = async (membershipRecord: MembershipRecord) => {
    await OrganizationMembershipModel.upsert({ ...membershipRecord });
};

export const updateOrganizationMembership = async (membershipRecord: MembershipRecord) => {
    await OrganizationMembershipModel.update(
        {
            permissionLevel: membershipRecord.permissionLevel,
        },
        { where: { userId: membershipRecord.userId, orgId: membershipRecord.orgId } }
    );
};

export const deleteOrganizationMembership = async (userId: UserId, orgId: OrganizationId) => {
    await OrganizationMembershipModel.destroy({ where: { userId, orgId } });
};
