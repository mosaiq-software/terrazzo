import {
    boardNameWithCode,
    CardHeader,
    cardNameWithBoardCodeAndNumber,
    fullName,
    fullNameWithUsername,
    ModuleHeader,
    OrganizationId,
    QueryableDatapoint,
    QueryableItem,
    settlePromises,
    TrzModuleType,
    UserId,
} from '@mosaiq/terrazzo-common';
import { getBoardByIdDb } from '@trz-api/persistence/boardPersistence';
import { getCardsByBoardIdDb } from '@trz-api/persistence/cardPersistence';
import { getModulesByOrgIdDb } from '@trz-api/persistence/modulePersistence';
import { getOrganizationMembershipsForOrgDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';
import {
    buildBoardNameVariants,
    buildCardNameVariants,
    buildDocumentNameVariants,
    buildUserNameVariants,
} from '../queryVariantBuilders';

export const getQueryableTagsForUserInOrg = async (
    userId: UserId,
    orgId: OrganizationId
): Promise<QueryableDatapoint[]> => {
    const queryableData: QueryableDatapoint[] = [];
    const org = await getOrgByIdDb(orgId);
    if (!org) {
        throw new Error('Organization not found');
    }

    const allBoardsInOrg = await getModulesByOrgIdDb(org.id, { type: TrzModuleType.Board, archived: false });
    const boardIndexingPromises = allBoardsInOrg.map((boardModule) => indexBoard(boardModule));

    const allDocumentsInOrg = await getModulesByOrgIdDb(org.id, { type: TrzModuleType.Document, archived: false });
    const documentIndexingPromises = allDocumentsInOrg.map((documentModule) => indexDocument(documentModule));

    const allMembersInOrg = await getOrganizationMembershipsForOrgDb(org.id);
    const memberIndexingPromises = allMembersInOrg.map((record) => indexUser(record.userId));

    const allIndexingPromises = [...boardIndexingPromises, ...documentIndexingPromises, ...memberIndexingPromises];
    const { fulfilled } = await settlePromises(allIndexingPromises);
    for (const result of fulfilled) {
        queryableData.push(...result);
    }

    return queryableData;
};

const indexDocument = async (documentModule: ModuleHeader): Promise<QueryableDatapoint[]> => {
    try {
        const documentQueryable: QueryableDatapoint = {
            display: documentModule.name,
            content: buildDocumentNameVariants(documentModule.name),
            id: documentModule.id,
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
        const cardQueryable: QueryableDatapoint = {
            display: cardNameWithBoardCodeAndNumber(card.name, boardCode, card.cardNumber),
            content: buildCardNameVariants(card.name, boardCode, card.cardNumber),
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

const indexUser = async (userId: UserId): Promise<QueryableDatapoint[]> => {
    try {
        const user = await getUserHeaderByIdDb(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const userQueryable: QueryableDatapoint = {
            display: fullNameWithUsername(user),
            content: buildUserNameVariants(fullName(user), user.username),
            id: user.id,
            type: QueryableItem.User,
        };
        return [userQueryable];
    } catch (e) {
        console.error('Error indexing user for query:', {
            userId: userId,
            error: e,
        });
        throw e;
    }
};
