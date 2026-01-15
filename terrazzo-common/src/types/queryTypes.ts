import { UID } from './genericTypes';

export enum QueryableItem {
    Board = 'board',
    Card = 'card',
    Document = 'document',
}
export interface QueryableDatapoint {
    /** The item id to link to */
    id: UID;
    /** The type of item that was queried */
    type: QueryableItem;
    /** The displayed title of the item in search results */
    display: string;
    /** The content to query against */
    content: string;
}

export interface QueryResult extends QueryableDatapoint {
    /** The fuzzy search score of the query result */
    score: number;
}
