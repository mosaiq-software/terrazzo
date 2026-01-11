import { RestRoutes, UploadedFileId } from '@mosaiq/terrazzo-common';
import { callTrzApi } from '@trz/util/apiUtils';
import { fileToBase64, getFileUrl } from '@trz/util/fileUtils';

export const useFileUploader = () => {
    /**
     * Sends the file to the server as a base64 string and returns the URL where it can be accessed.
     */
    const uploadFile = async (file: File): Promise<string> => {
        const base64 = await fileToBase64(file);
        // const fileId = await createFileUpload(sockCtx, file.name, base64, file.type);
        const fileId = (await callTrzApi(
            RestRoutes.UPLOAD_FILE,
            {},
            { base64, fileName: file.name, mimeType: file.type }
        )) as UploadedFileId | undefined;
        if (!fileId) {
            throw new Error('File upload failed');
        }
        const url = getFileUrl(fileId);
        return url;
    };
    return { uploadFile };
};
