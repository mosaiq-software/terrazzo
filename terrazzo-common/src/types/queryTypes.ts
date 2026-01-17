import { UID } from './genericTypes';

export enum QueryableItem {
    Board = 'board',
    Card = 'card',
    Document = 'document',
    User = 'user',
}

/**
 * Minimum data from a query to pass to client.
 */
export interface QueryItem {
    /** The item id to link to */
    id: UID;
    /** The type of item that was queried */
    type: QueryableItem;
    /** The displayed title of the item in search results */
    display: string;
}

/**
 * A datapoint that can be queried against for deep search functionality.
 */
export interface QueryableDatapoint extends QueryItem {
    /** The content to query against */
    content: string;
}

/**
 * A result from a query against QueryableDatapoints after fuzzy searching with a relevance score.
 */
export interface ScoredQueryableDatapoint extends QueryableDatapoint {
    /** The fuzzy search score of the query result */
    score: number;
}
