import { TextBlockId, UploadedFile } from '@mosaiq/terrazzo-common';
import { FileModel } from '@mosaiq/terrazzo-db';

export const getFileByIdDb = async (id: TextBlockId) => {
    const model = await FileModel.findByPk(id);
    return model?.toJSON();
};

export const createFileDb = async (file: UploadedFile) => {
    const model = await FileModel.create({ ...file });
    return model.toJSON();
};

export const writeFileDb = async (id: TextBlockId, base64: string, fileName: string, mimeType: string) => {
    const [updated] = await FileModel.update({ base64, fileName, mimeType }, { where: { id } });
    return updated;
};

export const deleteFileDb = async (id: TextBlockId) => {
    const deleted = await FileModel.destroy({ where: { id } });
    return deleted;
};
