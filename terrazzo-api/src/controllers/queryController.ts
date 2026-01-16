import {
    boardNameWithCode,
    CardHeader,
    cardNameWithBoardCodeAndNumber,
    fullNameWithUsername,
    ModuleHeader,
    OrganizationId,
    QueryableDatapoint,
    QueryableItem,
    QueryResult,
    QueryTag,
    ScoredQueryTag,
    settlePromises,
    TrzModuleType,
    UserId,
} from '@mosaiq/terrazzo-common';
import { getBoardByIdDb } from '@trz-api/persistence/boardPersistence';
import { getCardsByBoardIdDb } from '@trz-api/persistence/cardPersistence';
import { getDocumentByIdDb } from '@trz-api/persistence/documentPersistence';
import { getModulesByOrgIdDb } from '@trz-api/persistence/modulePersistence';
import { getOrganizationMembershipsForUserDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';
import Fuse from 'fuse.js';
import { getMembersInOrg } from './membershipController';
import { getQueryableTextBlockContent } from './textBlockController';

/** Cache each search session so that we only index once per use of the searchbar */
const CachedSearchSessions = new Map<UserId, { searchSessionId: string; datapoints: QueryableDatapoint[] }>();
const CachedTagSessions = new Map<UserId, { searchSessionId: string; tags: QueryTag[] }>();

const getAllQueryableDataForUserInOrg = async (userId: UserId, orgId: OrganizationId) => {
    const orgMemberships = await getOrganizationMembershipsForUserDb(userId);
    const allOrgIds = new Set<OrganizationId>();
    for (const om of orgMemberships) {
        allOrgIds.add(om.orgId);
        const org = await getOrgByIdDb(om.orgId);
        if (!org) continue;
    }

    const queryableData: QueryableDatapoint[] = [];

    const org = await getOrgByIdDb(orgId);
    if (!org) {
        return queryableData;
    }

    const allBoardsInOrg = await getModulesByOrgIdDb(org.id, { type: TrzModuleType.Board, archived: false });
    const boardIndexingPromises = allBoardsInOrg.map((boardModule) => indexBoard(boardModule));

    const allDocumentsInOrg = await getModulesByOrgIdDb(org.id, { type: TrzModuleType.Document, archived: false });
    const documentIndexingPromises = allDocumentsInOrg.map((documentModule) => indexDocument(documentModule));

    const allIndexingPromises = [...boardIndexingPromises, ...documentIndexingPromises];
    const { fulfilled } = await settlePromises(allIndexingPromises);
    for (const result of fulfilled) {
        queryableData.push(...result);
    }
    return queryableData;
};

const indexDocument = async (documentModule: ModuleHeader): Promise<QueryableDatapoint[]> => {
    try {
        const document = await getDocumentByIdDb(documentModule.id);
        if (!document) {
            throw new Error('Document not found');
        }
        const textBlockContent = await getQueryableTextBlockContent(document.textBlockId);
        const documentQueryable: QueryableDatapoint = {
            display: documentModule.name,
            content: `${documentModule.name} ${textBlockContent}`.toLowerCase(),
            id: document.id,
            type: QueryableItem.Document,
        };
        return [documentQueryable];
    } catch (e) {
        console.error('Error indexing document for query:', {
            documentId: documentModule.id,
            error: e,
        });
        throw e;
    }
};

const indexBoard = async (boardModule: ModuleHeader): Promise<QueryableDatapoint[]> => {
    try {
        const board = await getBoardByIdDb(boardModule.id);
        if (!board) {
            throw new Error('Board not found');
        }
        const boardQueryable: QueryableDatapoint = {
            display: boardNameWithCode(boardModule.name, board.boardCode),
            content: boardNameWithCode(boardModule.name, board.boardCode).toLowerCase(),
            id: board.id,
            type: QueryableItem.Board,
        };

        const cardsInBoard = await getCardsByBoardIdDb(boardModule.id, { archived: false });
        const cardIndexingPromises: Promise<QueryableDatapoint>[] = [];
        for (const card of cardsInBoard) {
            cardIndexingPromises.push(indexCard(card, board.boardCode));
        }
        const { fulfilled } = await settlePromises(cardIndexingPromises);

        return [boardQueryable, ...fulfilled];
    } catch (e) {
        console.error('Error indexing board for query:', {
            boardId: boardModule.id,
            error: e,
        });
        throw e;
    }
};

const indexCard = async (card: CardHeader, boardCode: string): Promise<QueryableDatapoint> => {
    try {
        const textBlockContent = await getQueryableTextBlockContent(card.descriptionTextBlockId);
        const cardQueryable: QueryableDatapoint = {
            display: cardNameWithBoardCodeAndNumber(card.name, boardCode, card.cardNumber),
            content:
                `${cardNameWithBoardCodeAndNumber(card.name, boardCode, card.cardNumber)} ${textBlockContent}`.toLowerCase(),
            id: card.id,
            type: QueryableItem.Card,
        };
        return cardQueryable;
    } catch (e) {
        console.error('Error indexing card for query:', {
            cardId: card.id,
            error: e,
        });
        throw e;
    }
};

export const executeQueryForUser = async (
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

const getTagsForUserInOrg = async (userId: UserId, orgId: OrganizationId): Promise<QueryTag[]> => {
    const queryTags: QueryTag[] = [];
    const org = await getOrgByIdDb(orgId);
    if (!org) {
        throw new Error('Organization not found');
    }
    const boardModules = await getModulesByOrgIdDb(org.id, { type: TrzModuleType.Board, archived: false });
    const boardPromises: Promise<void>[] = [];
    for (const board of boardModules) {
        boardPromises.push(
            (async () => {
                const boardData = await getBoardByIdDb(board.id);
                if (!boardData) {
                    throw new Error(`Board not found: ${board.id}`);
                }
                queryTags.push({
                    id: board.id,
                    name: boardNameWithCode(board.name, boardData.boardCode),
                    type: QueryableItem.Board,
                });

                const cards = await getCardsByBoardIdDb(board.id, { archived: false });
                for (const card of cards) {
                    queryTags.push({
                        id: card.id,
                        name: cardNameWithBoardCodeAndNumber(card.name, boardData.boardCode, card.cardNumber),
                        type: QueryableItem.Card,
                    });
                }
            })()
        );
    }
    await settlePromises(boardPromises);

    const documentModules = await getModulesByOrgIdDb(org.id, { type: TrzModuleType.Document, archived: false });
    for (const document of documentModules) {
        queryTags.push({
            id: document.id,
            name: document.name,
            type: QueryableItem.Document,
        });
    }

    const membersOfOrg = await getMembersInOrg(org.id);
    for (const member of membersOfOrg) {
        queryTags.push({
            id: member.user.id,
            name: fullNameWithUsername(member.user),
            type: QueryableItem.User,
        });
    }

    return queryTags;
};

export const executeTagQuery = async (
    userId: UserId,
    orgId: OrganizationId,
    query: string,
    searchSessionId: string
): Promise<QueryTag[]> => {
    try {
        let queryTags: QueryTag[] = [];
        const org = await getOrgByIdDb(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        const cachedSession = CachedTagSessions.get(userId);
        if (!cachedSession || cachedSession.searchSessionId !== searchSessionId) {
            queryTags = await getTagsForUserInOrg(userId, orgId);
            CachedTagSessions.set(userId, { searchSessionId, tags: queryTags });
        } else {
            queryTags = cachedSession.tags;
        }

        const fuse = new Fuse(queryTags, {
            keys: ['name'],
            ignoreDiacritics: true,
            includeScore: true,
        });

        const fuseResults = fuse.search(query);

        const results: ScoredQueryTag[] = fuseResults.map((result) => {
            return {
                ...result.item,
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
