import {
    OrganizationId,
    QueryableDatapoint,
    QueryItem,
    ScoredQueryableDatapoint,
    UserId,
} from '@mosaiq/terrazzo-common';
import Fuse from 'fuse.js';
import { getAllQueryableDataForUserInOrg } from './indexers/searchQueryIndexer';
import { getQueryableTagsForUserInOrg } from './indexers/tagQueryIndexer';

const MAX_SEARCH_RESULTS = 10;

const executeQuery = async (dataset: QueryableDatapoint[], query: string): Promise<QueryItem[]> => {
    const fuse = new Fuse(dataset, {
        keys: ['content'],
        ignoreDiacritics: true,
        includeScore: true,
    });
    const fuseResults = fuse.search(query);

    const sortedResults = fuseResults.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    const topResults = sortedResults.slice(0, MAX_SEARCH_RESULTS);
    const results: ScoredQueryableDatapoint[] = topResults.map((result) => {
        return {
            ...result.item,
            score: result.score ?? 0,
        };
    });
    const asQueryItems: QueryItem[] = results.map((result) => ({
        id: result.id,
        display: result.display,
        type: result.type,
    }));
    return asQueryItems;
};

export const executeSearchQueryForUser = async (
    userId: UserId,
    orgId: OrganizationId,
    query: string,
    searchSessionId: string
) => {
    const queryableData = await getAllQueryableDataForUserInOrg(userId, orgId);
    const results = await executeQuery(queryableData, query);
    return results;
};

export const executeTagQueryForUser = async (
    userId: UserId,
    orgId: OrganizationId,
    query: string,
    searchSessionId: string
): Promise<QueryItem[]> => {
    const queryableData = await getQueryableTagsForUserInOrg(userId, orgId);
    const results = await executeQuery(queryableData, query);
    return results;
};
