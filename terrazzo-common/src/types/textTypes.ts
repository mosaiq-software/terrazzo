import { TextBlockId } from './genericTypes';

export enum TextBlockType {
    PlainText = 'PlainText',
    BlockNote = 'BlockNote',
}

export enum TextBlockResourceType {
    Card = 'card',
    Document = 'document',
}

export interface CreateTextBlock {
    text: string;
    type: TextBlockType;
    trackHistory: boolean;
}

export interface UpdateTextBlock {
    text?: string;
    lastSnapshotAt?: number;
}

export interface TextBlock {
    id: TextBlockId;
    text: string;
    type: TextBlockType;
    trackHistory: boolean;
    lastSnapshotAt?: number;
}
