import { TextBlockId, UID, UploadedFileId, UserId } from './genericTypes';

export enum TextBlockType {
    PlainText = 'PlainText',
    BlockNote = 'BlockNote',
}

export interface TextBlock {
    id: TextBlockId;
    text: string;
    type: TextBlockType;
    trackHistory: boolean;
    lastSnapshotAt?: number;
}

export interface TextBlockHistorySnapshot {
    snapshotId: UID;
    textBlockId: TextBlockId;
    timestamp: number;
    diff: string; // Git-style patch string
}

export interface UploadedFile {
    id: UploadedFileId;
    base64: string;
    fileName: string;
    mimeType: string;
    createdAt: number;
    createdByUserId: UserId;
}
