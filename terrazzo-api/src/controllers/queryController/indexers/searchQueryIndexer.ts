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
import { getQueryableTextBlockContent } from '@trz-api/controllers/textBlockController/textBlockController';
import { getBoardByIdDb } from '@trz-api/persistence/boardPersistence';
import { getCardsByBoardIdDb } from '@trz-api/persistence/cardPersistence';
import { getDocumentByIdDb } from '@trz-api/persistence/documentPersistence';
import { getModulesByOrgIdDb } from '@trz-api/persistence/modulePersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';
import {
    buildDocumentNameAndContentVariants,
    buildBoardNameVariants,
    buildCardNameAndContentVariants,
} from '../queryVariantBuilders';

export const getAllQueryableDataForUserInOrg = async (userId: UserId, orgId: OrganizationId) => {
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

const indexBoard = async (boardModule: ModuleHeader): Promise<QueryableDatapoint[]> => {
    try {
        const board = await getBoardByIdDb(boardModule.id);
        if (!board) {
            throw new Error('Board not found');
        }
        const boardQueryable: QueryableDatapoint = {
            display: boardNameWithCode(boardModule.name, board.boardCode),
            content: buildBoardNameVariants(boardModule.name, board.boardCode),
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
