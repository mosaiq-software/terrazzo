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

export const updateOrgDb = async (id: OrganizationId, update: Partial<OrganizationHeader>) => {
    const [updated] = await OrgModel.update({ ...update }, { where: { id } });
    return updated;
};
