import { UploadedFileId } from '../types/genericTypes';

export const fileToBase64 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return base64;
};

export const getFileUrl = (fileId: UploadedFileId, apiUrl: string) => {
    return `${apiUrl}/file/${fileId}`;
};
