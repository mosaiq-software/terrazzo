import { TextBlockId, TextBlockSnapshotId } from './genericTypes';

export interface CreateTextBlockSnapshot {
    textBlockId: TextBlockId;
    content: string;
    tags?: string[];
}

export interface UpdateTextBlockSnapshot {
    tags?: string[];
}

export interface TextBlockSnapshot {
    snapshotId: TextBlockSnapshotId;
    textBlockId: TextBlockId;
    timestamp: number;
    content: string;
    tags?: string[];
}
