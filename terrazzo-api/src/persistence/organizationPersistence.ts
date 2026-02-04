import { OrganizationHeader, OrganizationId } from '@mosaiq/terrazzo-common';
import { OrganizationModel as OrgModel } from '@mosaiq/terrazzo-db';

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
