import { UploadedFile, UploadedFileId } from '@mosaiq/terrazzo-common';
import { CacheEntity, FileModel, getCached, invalidateCache } from '@mosaiq/terrazzo-db';

export const getFileByIdDb = async (id: UploadedFileId) => {
    return await getCached(CacheEntity.File, id, async () => {
        const model = await FileModel.findByPk(id);
        return model?.toJSON();
    });
};

export const createFileDb = async (file: UploadedFile) => {
    const model = await FileModel.create({ ...file });
    return model.toJSON();
};

export const writeFileDb = async (id: UploadedFileId, base64: string, fileName: string, mimeType: string) => {
    const [updated] = await FileModel.update({ base64, fileName, mimeType }, { where: { id } });
    await invalidateCache(CacheEntity.File, id);
    return updated;
};

export const deleteFileDb = async (id: UploadedFileId) => {
    const deleted = await FileModel.destroy({ where: { id } });
    await invalidateCache(CacheEntity.File, id);
    return deleted;
};
