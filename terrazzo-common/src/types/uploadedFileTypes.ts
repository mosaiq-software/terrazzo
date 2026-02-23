import { UploadedFileId, UserId } from './genericTypes';

export interface UploadedFile {
    id: UploadedFileId;
    base64: string;
    fileName: string;
    mimeType: string;
    createdAt: number;
    createdByUserId: UserId;
}
