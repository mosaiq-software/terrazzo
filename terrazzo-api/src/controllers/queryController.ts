import { OrganizationId, QueryableDatapoint, QueryResult, UserId } from '@mosaiq/terrazzo-common';
import { getOrganizationMembershipsForUserDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';
import Fuse from 'fuse.js';

/** Cache each search session so that we only index once per use of the searchbar */
const CachedSearchSessions = new Map<UserId, { searchSessionId: string; datapoints: QueryableDatapoint[] }>();

const getAllQueryableDataForUser = async (userId: UserId) => {
    const orgMemberships = await getOrganizationMembershipsForUserDb(userId);
    const allOrgIds = new Set<OrganizationId>();
    for (const om of orgMemberships) {
        allOrgIds.add(om.orgId);
        const org = await getOrgByIdDb(om.orgId);
        if (!org) continue;
    }

    const queryableData: QueryableDatapoint[] = [];

    // Board and cards
    //TODO make this use the new dir structure
    // const allProjectIds = new Set<UID>();
    // for (const pid of allProjectIds) {
    //     const boardIds = await getBoardsByParentId(pid);
    //     for (const board of boardIds) {
    //         if (!board || board.archived) continue;
    //         queryableData.push({
    //             title: board.name,
    //             display: `[${board.boardCode}] ${board.name}`,
    //             content: `[${board.boardCode}] ${board.name}`.toLowerCase(),
    //             id: board.id,
    //             type: DatapointType.BoardTitle,
    //         });
    //         const lists = await getListsByBoardId(board.id);
    //         for (const list of lists) {
    //             if (list.archived) continue;
    //             const cards = await getCardsByListId(list.id);
    //             for (const card of cards) {
    //                 if (card.archived) continue;
    //                 queryableData.push({
    //                     title: card.name,
    //                     display: `[${board.boardCode.length ? `${board.boardCode}-` : ''}${card.cardNumber}] ${card.name}`,
    //                     content: `${board.boardCode.length ? `${board.boardCode}-` : ''}${card.cardNumber} ${card.name}`.toLowerCase(),
    //                     id: card.id,
    //                     type: DatapointType.CardTitle,
    //                 });
    //                 const textBlockId = card.descriptionTextBlockId;
    //                 if (!textBlockId) continue;
    //                 const cardDescriptionEncoded = await getTextBlockById(textBlockId);
    //                 if (!cardDescriptionEncoded) continue;
    //                 const decodedText = remirrorYjsToPlaintext(cardDescriptionEncoded.text);
    //                 if (decodedText.trim().length === 0) continue;
    //                 queryableData.push({
    //                     title: card.name,
    //                     display: decodedText,
    //                     content: decodedText.toLowerCase(),
    //                     id: card.id,
    //                     type: DatapointType.CardDescription,
    //                 });
    //             }
    //         }
    //     }
    // }

    // // Documents
    // const parentIds = new Set<UID>([...allProjectIds, ...allOrgIds]);
    // for (const parentId of parentIds) {
    //     const documents = await getAllDocumentsForParent(parentId);
    //     for (const doc of documents) {
    //         if (doc.archived) continue;
    //         const title = doc.title;
    //         queryableData.push({
    //             title: title,
    //             display: title,
    //             content: title.toLowerCase(),
    //             id: doc.id,
    //             type: DatapointType.DocumentTitle,
    //         });
    //         const textBlock = await getTextBlockById(doc.textBlockId);
    //         if (!textBlock) continue;
    //         const content = remirrorYjsToPlaintext(textBlock.text);
    //         queryableData.push({
    //             title: title,
    //             display: content,
    //             content: content.toLowerCase(),
    //             id: doc.id,
    //             type: DatapointType.DocumentContent,
    //         });
    //     }
    // }

    return queryableData;
};

export const executeQueryForUser = async (userId: UserId, query: string, searchSessionId: string) => {
    let queryableData: QueryableDatapoint[] = [];
    const cachedSession = CachedSearchSessions.get(userId);
    if (!cachedSession || cachedSession.searchSessionId !== searchSessionId) {
        queryableData = await getAllQueryableDataForUser(userId);
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
