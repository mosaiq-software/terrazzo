import {
    boardNameWithCode,
    CardHeader,
    cardNameWithBoardCodeAndNumber,
    ModuleHeader,
    OrganizationId,
    QueryableDatapoint,
    QueryableItem,
    settlePromises,
    TrzModuleType,
    UserId,
} from '@mosaiq/terrazzo-common';
import {
    buildBoardNameVariants,
    buildCardNameAndContentVariants,
    buildDocumentNameAndContentVariants,
} from '../queryVariantBuilders';
import { defaultSearchQueryDataSource, SearchQueryDataSource } from './queryDataSources';

export const getAllQueryableDataForUserInOrg = async (userId: UserId, orgId: OrganizationId) => {
    return buildSearchIndex(defaultSearchQueryDataSource, userId, orgId);
};

export const buildSearchIndex = async (
    dataSource: SearchQueryDataSource,
    userId: UserId,
    orgId: OrganizationId
): Promise<QueryableDatapoint[]> => {
    const queryableData: QueryableDatapoint[] = [];

    const allBoardsInOrg = await dataSource.getModulesByOrgIdDb(orgId, { type: TrzModuleType.Board, archived: false });
    const boardIndexingPromises = allBoardsInOrg.map((boardModule) => indexBoard(dataSource, boardModule));

    const allDocumentsInOrg = await dataSource.getModulesByOrgIdDb(orgId, {
        type: TrzModuleType.Document,
        archived: false,
    });
    const documentIndexingPromises = allDocumentsInOrg.map((documentModule) =>
        indexDocument(dataSource, documentModule)
    );

    const allIndexingPromises = [...boardIndexingPromises, ...documentIndexingPromises];
    const { fulfilled } = await settlePromises(allIndexingPromises);
    for (const result of fulfilled) {
        queryableData.push(...result);
    }
    return queryableData;
};

const indexDocument = async (
    dataSource: SearchQueryDataSource,
    documentModule: ModuleHeader
): Promise<QueryableDatapoint[]> => {
    try {
        const document = await dataSource.getDocumentByIdDb(documentModule.id);
        if (!document) {
            throw new Error('Document not found');
        }
        const textBlockContent = await dataSource.getQueryableTextBlockContent(document.textBlockId);
        const documentQueryable: QueryableDatapoint = {
            display: documentModule.name,
            content: buildDocumentNameAndContentVariants(documentModule.name, textBlockContent),
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

const indexBoard = async (
    dataSource: SearchQueryDataSource,
    boardModule: ModuleHeader
): Promise<QueryableDatapoint[]> => {
    try {
        const board = await dataSource.getBoardByIdDb(boardModule.id);
        if (!board) {
            throw new Error('Board not found');
        }
        const boardQueryable: QueryableDatapoint = {
            display: boardNameWithCode(boardModule.name, board.boardCode),
            content: buildBoardNameVariants(boardModule.name, board.boardCode),
            id: board.id,
            type: QueryableItem.Board,
        };

        const cardsInBoard = await dataSource.getCardsByBoardIdDb(boardModule.id, { archived: false });
        const cardIndexingPromises: Promise<QueryableDatapoint>[] = [];
        for (const card of cardsInBoard) {
            cardIndexingPromises.push(indexCard(dataSource, card, board.boardCode));
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

const indexCard = async (
    dataSource: SearchQueryDataSource,
    card: CardHeader,
    boardCode: string
): Promise<QueryableDatapoint> => {
    try {
        const textBlockContent = await dataSource.getQueryableTextBlockContent(card.descriptionTextBlockId);
        const cardQueryable: QueryableDatapoint = {
            display: cardNameWithBoardCodeAndNumber(card.name, boardCode, card.cardNumber),
            content: buildCardNameAndContentVariants(card.name, boardCode, card.cardNumber, textBlockContent),
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
