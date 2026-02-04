import { OrganizationHeader, OrganizationId } from '@mosaiq/terrazzo-common';
import { CacheEntity, OrganizationModel as OrgModel, getCached, invalidateCache } from '@mosaiq/terrazzo-db';

export const getOrgByIdDb = async (id: OrganizationId) => {
    return await getCached(CacheEntity.Organization, id, async () => {
        const model = await OrgModel.findByPk(id);
        return model?.toJSON();
    });
};

export const createOrgDb = async (org: OrganizationHeader) => {
    const model = await OrgModel.create({ ...org });
    return model.toJSON();
};

export const updateOrgDb = async (org: OrganizationHeader) => {
    const [updated] = await OrgModel.update({ ...org }, { where: { id: org.id } });
    await invalidateCache(CacheEntity.Organization, org.id);
    return updated;
};
