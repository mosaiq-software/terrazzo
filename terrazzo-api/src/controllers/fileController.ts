import { SYSTEM_USER_ID, UploadedFileId, UserId } from '@mosaiq/terrazzo-common';
import { createFileDb, getFileByIdDb } from '@trz-api/persistence/filePersistence';
import axios from 'axios';

export const getFile = async (fileId: UploadedFileId) => {
    const retrievedFile = await getFileByIdDb(fileId);
    const base64 = retrievedFile?.base64;
    const file = Buffer.from(base64 || '', 'base64');
    return {
        ...retrievedFile,
        file,
    };
};

export const createFile = async (base64: string, fileName: string, mimeType: string, createdByUserId: UserId) => {
    const createdFile = await createFileDb(base64, fileName, mimeType, createdByUserId);
    return createdFile;
};

/**
 * Downloads a file from the given URL and stores it in Terrazzo's file storage.
 * @param fileUrl The URL of the file to download and store.
 * @returns The metadata of the created file in Terrazzo.
 * @throws An error if the file could not be downloaded or stored.
 */
export const saveFileFromUrl = async (fileUrl: string) => {
    try {
        const response = await axios.get<ArrayBuffer>(fileUrl, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(response.data);
        const base64 = fileBuffer.toString('base64');
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const contentDisposition = response.headers['content-disposition'] || '';
        let fileName = 'file';
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1];
        }
        const createdFile = await createFileDb(base64, fileName, contentType, SYSTEM_USER_ID);
        return createdFile;
    } catch (error) {
        console.error('Error saving file from URL:', error);
        throw error;
    }
};
