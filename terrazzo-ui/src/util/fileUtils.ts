import { UploadedFileId } from '@mosaiq/terrazzo-common';
import { getApiUrl } from './apiUtils';

export const fileToBase64 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return base64;
};

export const getFileUrl = (fileId: UploadedFileId) => {
    const apiUrl = getApiUrl();
    return `${apiUrl}/file/${fileId}`;
};
