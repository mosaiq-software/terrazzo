import { Invite, InviteId, OrganizationId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class InviteModel extends Model {}
InviteModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        forOrganizationId: DataTypes.STRING,
        maxUses: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        uses: DataTypes.INTEGER,
        createdById: DataTypes.STRING,
        createdAt: DataTypes.STRING,
    },
    { sequelize, timestamps: false }
);

export const getInviteRecordById = async (id: InviteId) => {
    return (await InviteModel.findByPk(id, {}))?.toJSON() as Invite | undefined;
};

export const getAllInviteRecordsForOrganization = async (orgId: OrganizationId) => {
    return (
        await InviteModel.findAll({
            where: { forOrganizationId: orgId },
            order: [['createdAt', 'DESC']],
        })
    ).map((inv) => inv.toJSON()) as Invite[];
};

export const createInviteRecord = async (invite: Invite) => {
    return await InviteModel.create({ ...invite });
};

export const deleteInviteRecord = async (inviteId: InviteId) => {
    return await InviteModel.destroy({ where: { id: inviteId } });
};

export const updateInviteRecord = async (invite: Partial<Invite> & { id: InviteId }) => {
    return await InviteModel.update({ ...invite }, { where: { id: invite.id } });
};
