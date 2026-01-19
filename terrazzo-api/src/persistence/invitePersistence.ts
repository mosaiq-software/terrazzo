import { Invite, InviteId, OrganizationId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class InviteModel extends Model<Invite> {}
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
        revokedAt: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    { sequelize, timestamps: false, tableName: 'Invites' }
);

export const getInviteRecordByIdDb = async (id: InviteId) => {
    const model = await InviteModel.findByPk(id, {});
    return model?.toJSON();
};

export const getAllInviteRecordsForOrganizationDb = async (orgId: OrganizationId) => {
    const models = await InviteModel.findAll({
        where: { forOrganizationId: orgId },
        order: [['createdAt', 'DESC']],
    });
    return models.map((inv) => inv.toJSON());
};

export const createInviteRecordDb = async (invite: Invite) => {
    const model = await InviteModel.create({ ...invite });
    return model.toJSON();
};

export const updateInviteRecordDb = async (invite: Partial<Invite> & { id: InviteId }) => {
    const [updated] = await InviteModel.update({ ...invite }, { where: { id: invite.id } });
    return updated;
};
