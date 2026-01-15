import { UID } from './genericTypes';

export enum QueryableItem {
    Board = 'board',
    Card = 'card',
    Document = 'document',
    User = 'user',
}

/**
 * A datapoint that can be queried against for deep search functionality.
 */
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

/**
 * A result from a query against QueryableDatapoints after fuzzy searching with a relevance score.
 */
export interface QueryResult extends QueryableDatapoint {
    /** The fuzzy search score of the query result */
    score: number;
}

/**
 * A tag that can be searched in simple contexts such as mentions in a document.
 * There is no differentiation between the rendered text and query text for tags. Wysiwyg.
 */
export interface QueryTag {
    /** The id of the resource this links to */
    id: UID;
    /** The type of resource this tag is associated with */
    type: QueryableItem;
    /** The name of the tag */
    name: string;
}

export interface ScoredQueryTag extends QueryTag {
    /** The fuzzy search score of the tag */
    score: number;
}
