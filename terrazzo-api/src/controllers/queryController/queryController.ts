import {
    OrganizationId,
    QueryableDatapoint,
    QueryResult,
    QueryTag,
    ScoredQueryTag,
    UserId,
} from '@mosaiq/terrazzo-common';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';
import Fuse from 'fuse.js';
import { getAllQueryableDataForUserInOrg } from './indexers/searchQueryIndexer';
import { getQueryableTagsForUserInOrg } from './indexers/tagQueryIndexer';

/** Cache each search session so that we only index once per use of the searchbar */
const CachedSearchSessions = new Map<UserId, { searchSessionId: string; datapoints: QueryableDatapoint[] }>();
const CachedTagSessions = new Map<UserId, { searchSessionId: string; datapoints: QueryableDatapoint[] }>();

export const executeSearchQueryForUser = async (
    userId: UserId,
    orgId: OrganizationId,
    query: string,
    searchSessionId: string
) => {
    let queryableData: QueryableDatapoint[] = [];
    const cachedSession = CachedSearchSessions.get(userId);
    if (!cachedSession || cachedSession.searchSessionId !== searchSessionId) {
        queryableData = await getAllQueryableDataForUserInOrg(userId, orgId);
        CachedSearchSessions.set(userId, { searchSessionId, datapoints: queryableData });
    } else {
        queryableData = cachedSession.datapoints;
    }

    const fuse = new Fuse(queryableData, {
        keys: ['content'],
        ignoreDiacritics: true,
        includeScore: true,
    });

    const fuseResults = fuse.search(query);

    const results: QueryResult[] = fuseResults.map((result) => {
        return {
            ...result.item,
            score: result.score ?? 0,
        };
    });

    const sortedResults = results.sort((a, b) => a.score - b.score);
    const topResults = sortedResults.slice(0, 10);

    return topResults;
};

export const executeTagQueryForUser = async (
    userId: UserId,
    orgId: OrganizationId,
    query: string,
    searchSessionId: string
): Promise<QueryTag[]> => {
    try {
        let queryableData: QueryableDatapoint[] = [];
        const org = await getOrgByIdDb(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        const cachedSession = CachedTagSessions.get(userId);
        if (!cachedSession || cachedSession.searchSessionId !== searchSessionId) {
            queryableData = await getQueryableTagsForUserInOrg(userId, orgId);
            CachedTagSessions.set(userId, { searchSessionId, datapoints: queryableData });
        } else {
            queryableData = cachedSession.datapoints;
        }

        const fuse = new Fuse(queryableData, {
            keys: ['name'],
            ignoreDiacritics: true,
            includeScore: true,
        });

        const fuseResults = fuse.search(query);

        const results: ScoredQueryTag[] = fuseResults.map((result) => {
            return {
                id: result.item.id,
                type: result.item.type,
                name: result.item.display,
                score: result.score ?? 0,
            };
        });

        const sortedResults = results.sort((a, b) => a.score - b.score);
        const topResults = sortedResults.slice(0, 10);

        return topResults;
    } catch (e) {
        console.error('Error fetching search tags for user in org:', {
            userId,
            orgId,
            error: e,
        });
        throw e;
    }
};
