import { Invite, InviteId, OrganizationId } from '@mosaiq/terrazzo-common';
import { InviteModel } from '@mosaiq/terrazzo-db';

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

export const getInviteIdsByOrganizationDb = async (orgId: OrganizationId): Promise<InviteId[]> => {
    const models = await InviteModel.findAll({
        attributes: ['id'],
        where: { forOrganizationId: orgId },
        order: [['createdAt', 'DESC']],
    });
    return models.map((inv) => inv.toJSON().id);
};

export const createInviteRecordDb = async (invite: Invite) => {
    const model = await InviteModel.create({ ...invite });
    return model.toJSON();
};

export const updateInviteRecordDb = async (invite: Partial<Invite> & { id: InviteId }) => {
    const [updated] = await InviteModel.update({ ...invite }, { where: { id: invite.id } });
    return updated;
};
