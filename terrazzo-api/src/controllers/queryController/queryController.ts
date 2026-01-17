import {
    OrganizationId,
    QueryableDatapoint,
    QueryableItem,
    QueryItem,
    ScoredQueryableDatapoint,
    UID,
    UserId,
} from '@mosaiq/terrazzo-common';
import Fuse from 'fuse.js';
import { getAllQueryableDataForUserInOrg } from './indexers/searchQueryIndexer';
import { getQueryableTagsForUserInOrg } from './indexers/tagQueryIndexer';

const MAX_SEARCH_RESULTS = 10;

/**
 * Escapes user input for safe usage in a regular expression.
 */
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Normalizes a query string by lowercasing and collapsing non-alphanumerics to spaces.
 */
const normalizeQuery = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

/**
 * Removes leading zeros from numeric tokens (e.g., 001 -> 1).
 */
const normalizeLeadingZeros = (value: string) => value.replace(/\b0+(\d+)/g, '$1');

/**
 * Expands tokens into alpha/numeric parts for more flexible matching.
 */
const expandTokens = (tokens: string[]) => {
    const expanded: string[] = [];
    for (const token of tokens) {
        expanded.push(token);
        const parts = token.match(/[a-z]+|\d+/gi);
        if (parts && parts.length > 1) {
            expanded.push(...parts);
        }
    }
    return [...new Set(expanded.filter(Boolean))];
};

/**
 * Builds combined alphanumeric code tokens like "rm1" from adjacent alpha + digit tokens.
 */
const buildCodeTokens = (rawTokens: string[]) => {
    const combinedTokens: string[] = [];
    for (let i = 0; i < rawTokens.length - 1; i++) {
        const left = rawTokens[i];
        const right = rawTokens[i + 1];
        if (/^[a-z]+$/.test(left) && /^\d+$/.test(right)) {
            combinedTokens.push(`${left}${right}`);
        }
    }
    const tokens = expandTokens(rawTokens);
    return [...new Set([...combinedTokens, ...tokens])].filter((token) => /[a-z]+\d+/.test(token));
};

/**
 * Builds a lookup of Fuse scores by item id for stable downstream scoring.
 */
const buildFuseScores = (fuseResults: ReturnType<Fuse<QueryableDatapoint>['search']>) => {
    const fuseScoreById = new Map<string, number>();
    for (const result of fuseResults) {
        fuseScoreById.set((result.item as QueryableDatapoint).id, result.score ?? 1);
    }
    return fuseScoreById;
};

/**
 * Builds a candidate set from Fuse hits plus simple substring/token matches.
 */
const buildCandidates = (
    dataset: QueryableDatapoint[],
    fuseResults: ReturnType<Fuse<QueryableDatapoint>['search']>,
    normalizedQuery: string,
    tokens: string[]
) => {
    const candidates = new Map<UID, QueryableDatapoint>();
    for (const result of fuseResults) {
        const item = result.item as QueryableDatapoint;
        candidates.set(item.id, item);
    }

    for (const item of dataset) {
        const content = item.content.toLowerCase();
        const hasExact = content.includes(normalizedQuery);
        const tokenHits = tokens.filter((token) => content.includes(token)).length;
        if (hasExact || tokenHits > 0) {
            candidates.set(item.id, item);
        }
    }

    return candidates;
};

interface ScoredCandidate {
    item: QueryableDatapoint;
    displayExactSubstring: boolean;
    displayTokenHits: number;
    exactSubstring: boolean;
    tokenHits: number;
    digitMatch: boolean;
    codeTokenMatch: boolean;
    codeDisplayMatch: boolean;
    codeContentMatch: boolean;
    fuseScore: number;
}

/**
 * Computes scoring metadata used for custom ranking rules.
 */
const buildScoredCandidates = (
    candidates: Map<string, QueryableDatapoint>,
    fuseScoreById: Map<string, number>,
    normalizedQuery: string,
    tokens: string[],
    digitRegex: RegExp | null,
    tokenRegex: RegExp | null,
    primaryCodeToken?: string
): ScoredCandidate[] => {
    return Array.from(candidates.values()).map((item) => {
        const content = item.content.toLowerCase();
        const contentCompact = content.replace(/[^a-z0-9]+/gi, '');
        const display = item.display.toLowerCase();
        const displayCompact = display.replace(/[^a-z0-9]+/gi, '');
        const displayExactSubstring = display.includes(normalizedQuery);
        const displayTokenHits = tokens.filter((token) => display.includes(token)).length;
        const exactSubstring = content.includes(normalizedQuery);
        const tokenHits = tokens.filter((token) => content.includes(token)).length;
        const digitMatch = digitRegex ? digitRegex.test(content) : false;
        const codeTokenMatch = tokenRegex ? tokenRegex.test(content) : false;
        const codeDisplayMatch = primaryCodeToken ? displayCompact.includes(primaryCodeToken) : false;
        const codeContentMatch = primaryCodeToken ? contentCompact.includes(primaryCodeToken) : false;
        const fuseScore = fuseScoreById.get(item.id) ?? 1;
        return {
            item,
            displayExactSubstring,
            displayTokenHits,
            exactSubstring,
            tokenHits,
            digitMatch,
            codeTokenMatch,
            codeDisplayMatch,
            codeContentMatch,
            fuseScore,
        };
    });
};

/**
 * Priority order for item types in search results.
 * 0 = highest priority
 */
const typePriority: QueryableItem[] = [
    QueryableItem.Board,
    QueryableItem.Document,
    QueryableItem.Card,
    QueryableItem.User,
];

const getTypePriority = (type: QueryableItem): number => {
    const index = typePriority.indexOf(type);
    return index === -1 ? 99 : index;
};

interface CompareScoredCandidatesOptions {
    primaryCodeToken?: string;
    hasDigits?: boolean;
    codeOnlyQuery?: boolean;
}
const compareScoredCandidates = (
    a: ScoredCandidate,
    b: ScoredCandidate,
    options: CompareScoredCandidatesOptions
): number => {
    const { primaryCodeToken, hasDigits, codeOnlyQuery } = options;
    if (primaryCodeToken) {
        if (a.codeDisplayMatch !== b.codeDisplayMatch) {
            return a.codeDisplayMatch ? -1 : 1;
        }
        if (a.codeContentMatch !== b.codeContentMatch) {
            return a.codeContentMatch ? -1 : 1;
        }
    }
    if (a.displayExactSubstring !== b.displayExactSubstring) {
        return a.displayExactSubstring ? -1 : 1;
    }
    if (a.displayTokenHits !== b.displayTokenHits) {
        return b.displayTokenHits - a.displayTokenHits;
    }
    if (a.exactSubstring !== b.exactSubstring) {
        return a.exactSubstring ? -1 : 1;
    }
    if (a.tokenHits !== b.tokenHits) {
        return b.tokenHits - a.tokenHits;
    }
    if (hasDigits && a.digitMatch !== b.digitMatch) {
        return a.digitMatch ? -1 : 1;
    }
    if (codeOnlyQuery && a.codeTokenMatch !== b.codeTokenMatch) {
        return a.codeTokenMatch ? -1 : 1;
    }
    if (a.item.type !== b.item.type) {
        return getTypePriority(a.item.type) - getTypePriority(b.item.type);
    }
    if (a.fuseScore !== b.fuseScore) {
        return a.fuseScore - b.fuseScore;
    }
    return 0;
};

/**
 * Executes a fuzzy query against a dataset and returns client-safe items.
 */
export const executeQuery = async (dataset: QueryableDatapoint[], query: string): Promise<QueryItem[]> => {
    // Step 1: Normalize the input query into comparable tokens.
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
        return [];
    }
    const normalizedQueryNoZeros = normalizeLeadingZeros(normalizedQuery);
    const codeOnlyQuery = /^[a-z]+$/.test(normalizedQueryNoZeros);
    const tokenRegex = codeOnlyQuery ? new RegExp(`\\b${escapeRegExp(normalizedQuery)}\\b`, 'i') : null;
    const digitToken = normalizedQueryNoZeros.match(/\d+/)?.[0];
    const digitRegex = digitToken ? new RegExp(`\\b${escapeRegExp(digitToken)}\\b`, 'i') : null;
    const hasDigits = Boolean(digitToken);
    const rawTokens = normalizedQueryNoZeros.split(' ').filter(Boolean);
    const tokens = expandTokens(rawTokens);
    const codeTokens = buildCodeTokens(rawTokens);
    const primaryCodeToken = codeTokens[0];

    // Step 2: Run Fuse to get baseline fuzzy matches.
    const fuse = new Fuse(dataset, {
        keys: ['content'],
        ignoreDiacritics: true,
        includeScore: true,
    });
    const fuseResults = fuse.search(normalizedQueryNoZeros);

    // Step 3: Expand candidates with simple substring/token matches.
    const fuseScoreById = buildFuseScores(fuseResults);
    const candidates = buildCandidates(dataset, fuseResults, normalizedQueryNoZeros, tokens);

    // Step 4: Compute ranking metadata and apply custom ranking rules.
    const scoredCandidates = buildScoredCandidates(
        candidates,
        fuseScoreById,
        normalizedQueryNoZeros,
        tokens,
        digitRegex,
        tokenRegex,
        primaryCodeToken
    );

    const compareScoredCandidatesOptions: CompareScoredCandidatesOptions = {
        primaryCodeToken,
        hasDigits,
        codeOnlyQuery,
    };
    const sortedCandidates = scoredCandidates.sort((a, b) =>
        compareScoredCandidates(a, b, compareScoredCandidatesOptions)
    );

    // Step 5: Slice to top results and return a client-safe shape.
    const topResults = sortedCandidates.slice(0, MAX_SEARCH_RESULTS);
    const results: ScoredQueryableDatapoint[] = topResults.map((result) => {
        return {
            ...result.item,
            score: result.fuseScore ?? 0,
        };
    });
    const asQueryItems: QueryItem[] = results.map((result) => ({
        id: result.id,
        display: result.display,
        type: result.type,
    }));
    return asQueryItems;
};

/**
 * Executes a full-text search query for a user within an organization.
 */
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

/**
 * Executes a tag search query for a user within an organization.
 */
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
