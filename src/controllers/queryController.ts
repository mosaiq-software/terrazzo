import { DatapointType, QueryableDatapoint, QueryResult, UserId } from '@mosaiq/terrazzo-common/types';
import { getAllActiveBoardIdsForUser } from './userController';
import { getCardsByListId } from '@trz-api/persistence/cardPersistence';
import { getBoardById } from '@trz-api/persistence/boardPersistence';
import { getListsByBoardId } from '@trz-api/persistence/listPersistence';
import { getTextBlockById } from '@trz-api/persistence/textBlockPersistence';
import { remirrorYjsToPlaintext } from './textBlockController';
import Fuse from 'fuse.js';

/** Cache each search session so that we only index once per use of the searchbar */
const CachedSearchSessions = new Map<UserId, { searchSessionId: string; datapoints: QueryableDatapoint[] }>();

const getAllQueryableDataForUser = async (userId: UserId) => {
    const boardIds = await getAllActiveBoardIdsForUser(userId);
    const queryableData: QueryableDatapoint[] = [];
    for (const boardId of boardIds) {
        const board = await getBoardById(boardId);
        if (!board || board.archived) continue;
        queryableData.push({
            title: board.name,
            display: `[${board.boardCode}] ${board.name}`,
            content: `[${board.boardCode}] ${board.name}`.toLowerCase(),
            id: board.id,
            type: DatapointType.BoardTitle,
        });
        const lists = await getListsByBoardId(boardId);
        for (const list of lists) {
            if (list.archived) continue;
            const cards = await getCardsByListId(list.id);
            for (const card of cards) {
                if (card.archived) continue;
                queryableData.push({
                    title: card.name,
                    display: `[${board.boardCode.length ? `${board.boardCode}-` : ''}${card.cardNumber}] ${card.name}`,
                    content: `${board.boardCode.length ? `${board.boardCode}-` : ''}${card.cardNumber} ${card.name}`.toLowerCase(),
                    id: card.id,
                    type: DatapointType.CardTitle,
                });
                const textBlockId = card.descriptionTextBlockId;
                if (!textBlockId) continue;
                const cardDescriptionEncoded = await getTextBlockById(textBlockId);
                if (!cardDescriptionEncoded) continue;
                const decodedText = remirrorYjsToPlaintext(cardDescriptionEncoded.text);
                if (decodedText.trim().length === 0) continue;
                queryableData.push({
                    title: card.name,
                    display: decodedText,
                    content: decodedText.toLowerCase(),
                    id: card.id,
                    type: DatapointType.CardDescription,
                });
            }
        }
    }
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
