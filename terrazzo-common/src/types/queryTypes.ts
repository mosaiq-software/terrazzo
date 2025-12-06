import { UID } from './genericTypes';

export enum DatapointType {
    BoardTitle = 'board.title',
    CardTitle = 'card.title',
    CardDescription = 'card.description',
    DocumentTitle = 'document.title',
    DocumentContent = 'document.content',
}
export interface QueryableDatapoint {
    title: string;
    display: string;
    content: string;
    id: UID;
    type: DatapointType;
}

export interface QueryResult extends QueryableDatapoint {
    score: number;
}
