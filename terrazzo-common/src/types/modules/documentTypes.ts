import { TextBlockId, UploadedFileId, UserId } from '../genericTypes';
import { ModuleHeader, TrzModuleType } from './moduleTypes';

export interface DocumentHeader extends ModuleHeader {
    type: TrzModuleType.Document;
    textBlockId: TextBlockId;
    lastModifiedAt: number;
    lastModifiedByUserId: UserId;
}

export interface TextBlock {
    id: TextBlockId;
    text: string;
}

export interface UploadedFile {
    id: UploadedFileId;
    base64: string;
    fileName: string;
    mimeType: string;
    createdAt: number;
    createdByUserId: UserId;
}
