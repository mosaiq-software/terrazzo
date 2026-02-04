import { DirectoryId } from '@mosaiq/terrazzo-common';
import { DirectoryModel } from '@mosaiq/terrazzo-db';

export interface DirectoryModelType {
    id: DirectoryId;
}

export const getDirectoryByIdDb = async (id: DirectoryId) => {
    const model = await DirectoryModel.findByPk(id, {});
    return model?.toJSON();
};

export const createDirectoryDb = async (document: DirectoryModelType) => {
    const model = await DirectoryModel.create({ ...document });
    return model.toJSON();
};

export const updateDirectoryDb = async (id: DirectoryId, document: Partial<DirectoryModelType>) => {
    const [updated] = await DirectoryModel.update({ ...document }, { where: { id: id } });
    return updated;
};
