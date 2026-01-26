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
    const uid = crypto.randomUUID();
    const createdFile = await createFileDb({
        id: uid,
        base64,
        fileName,
        mimeType,
        createdAt: Date.now(),
        createdByUserId,
    });
    return createdFile;
};

/**
 * Downloads a file from the given URL and stores it in Terrazzo's file storage.
 * If the failure occurs during download or storage, the error is logged but not thrown.
 * @param fileUrl The URL of the file to download and store.
 * @returns The id of the potentially created file in Terrazzo.
 */
export const saveFileFromUrl = (fileUrl: string): UploadedFileId => {
    try {
        const uid = crypto.randomUUID();
        const handleFileCreation = async () => {
            let base64: string | undefined = undefined;
            let fileName: string | undefined = undefined;
            let contentType: string | undefined = undefined;
            try {
                const response = await axios.get<ArrayBuffer>(fileUrl, { responseType: 'arraybuffer' });
                const fileBuffer = Buffer.from(response.data);
                base64 = fileBuffer.toString('base64');
                contentType = response.headers['content-type'] || 'application/octet-stream';
                const contentDisposition = response.headers['content-disposition'] || '';
                fileName = 'file';
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1];
                }
                if (!base64 || !fileName || !contentType) {
                    throw new Error('Missing file data after download');
                }
            } catch (error) {
                console.error('Error downloading or saving file from URL:', {
                    fileUrl,
                    uid,
                    error,
                });
                return;
            }
            try {
                await createFileDb({
                    id: uid,
                    base64,
                    fileName,
                    mimeType: contentType,
                    createdAt: Date.now(),
                    createdByUserId: SYSTEM_USER_ID,
                });
            } catch (error) {
                console.error('Error creating file in DB from URL:', {
                    fileUrl,
                    uid,
                    error,
                });
            }
        };
        void handleFileCreation();
        return uid;
    } catch (error) {
        console.error('Error saving file from URL:', error);
        throw error;
    }
};
