import { TextBlockId, TextBlockSnapshotId } from './genericTypes';

export interface CreateTextBlockSnapshot {
    textBlockId: TextBlockId;
}

export interface UpdateTextBlockSnapshot {}

export interface TextBlockSnapshot {
    snapshotId: TextBlockSnapshotId;
    textBlockId: TextBlockId;
    timestamp: number;
    content: string;
    tags?: string[];
}
