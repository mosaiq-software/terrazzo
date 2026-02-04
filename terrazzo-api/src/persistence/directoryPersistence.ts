import { DirectoryId } from '@mosaiq/terrazzo-common';
import { CacheEntity, DirectoryModel, DirectoryModelType, getCached, invalidateCache } from '@mosaiq/terrazzo-db';

export const getDirectoryByIdDb = async (id: DirectoryId) => {
    return await getCached(CacheEntity.Directory, id, async () => {
        const model = await DirectoryModel.findByPk(id);
        return model?.toJSON();
    });
};

export const createDirectoryDb = async (document: DirectoryModelType) => {
    const model = await DirectoryModel.create({ ...document });
    return model.toJSON();
};

export const updateDirectoryDb = async (id: DirectoryId, document: Partial<DirectoryModelType>) => {
    const [updated] = await DirectoryModel.update({ ...document }, { where: { id: id } });
    await invalidateCache(CacheEntity.Directory, id);
    return updated;
};
