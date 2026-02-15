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
import {
    buildBoardNameVariants,
    buildCardNameVariants,
    buildDocumentNameVariants,
    buildUserNameVariants,
} from '../queryVariantBuilders';
import { defaultTagsQueryDataSource, TagsQueryDataSource } from './queryDataSources';

export const getQueryableTagsForUserInOrg = async (
    userId: UserId,
    orgId: OrganizationId
): Promise<QueryableDatapoint[]> => {
    return buildTagIndex(defaultTagsQueryDataSource, userId, orgId);
};

export const buildTagIndex = async (
    dataSource: TagsQueryDataSource,
    userId: UserId,
    orgId: OrganizationId
): Promise<QueryableDatapoint[]> => {
    const queryableData: QueryableDatapoint[] = [];

    const allBoardsInOrg = await dataSource.getModulesByOrgIdDb(orgId, { type: TrzModuleType.Board, archived: false });
    const boardsInOrg = allBoardsInOrg.filter(
        (mod): mod is ModuleHeader<TrzModuleType.Board> => mod.type === TrzModuleType.Board
    );
    const boardIndexingPromises = boardsInOrg.map((boardModule) => indexBoard(dataSource, boardModule));

    const allDocumentsInOrg = await dataSource.getModulesByOrgIdDb(orgId, {
        type: TrzModuleType.Document,
        archived: false,
    });
    const documentIndexingPromises = allDocumentsInOrg.map((documentModule) =>
        indexDocument(dataSource, documentModule)
    );

    const allMembersInOrg = await dataSource.getOrganizationMembershipsForOrgDb(orgId);
    const memberIndexingPromises = allMembersInOrg.map((record) => indexUser(dataSource, record.userId));

    const allIndexingPromises = [...boardIndexingPromises, ...documentIndexingPromises, ...memberIndexingPromises];
    const { fulfilled } = await settlePromises(allIndexingPromises);
    for (const result of fulfilled) {
        queryableData.push(...result);
    }

    return queryableData;
};

const indexDocument = async (
    dataSource: TagsQueryDataSource,
    documentModule: ModuleHeader
): Promise<QueryableDatapoint[]> => {
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

const indexBoard = async (
    dataSource: TagsQueryDataSource,
    boardModule: ModuleHeader<TrzModuleType.Board>
): Promise<QueryableDatapoint[]> => {
    try {
        const boardCode = boardModule.data.boardCode;
        const boardQueryable: QueryableDatapoint = {
            display: boardNameWithCode(boardModule.name, boardCode),
            content: buildBoardNameVariants(boardModule.name, boardCode),
            id: boardModule.id,
            type: QueryableItem.Board,
        };

        const cardsInBoard = await dataSource.getActiveCardsByBoardIdDb(boardModule.id);
        const cardIndexingPromises: Promise<QueryableDatapoint>[] = [];
        for (const card of cardsInBoard) {
            cardIndexingPromises.push(indexCard(dataSource, card, boardCode));
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
    dataSource: TagsQueryDataSource,
    card: CardHeader,
    boardCode: string
): Promise<QueryableDatapoint> => {
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

const indexUser = async (dataSource: TagsQueryDataSource, userId: UserId): Promise<QueryableDatapoint[]> => {
    try {
        const user = await dataSource.getUserHeader(userId);
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
