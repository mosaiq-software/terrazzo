import { OrganizationId, QueryableDatapoint, TrzModuleType, UID, UserHeader, UserId } from '@mosaiq/terrazzo-common';
import { expect } from 'vitest';
import { getAllQueryableDataForUserInOrg } from '../indexers/searchQueryIndexer';
import { getQueryableTagsForUserInOrg } from '../indexers/tagQueryIndexer';
import {
    getBoardByIdDbMock,
    getCardsByBoardIdDbMock,
    getDocumentByIdDbMock,
    getModulesByOrgIdDbMock,
    getOrgByIdDbMock,
    getOrganizationMembershipsForOrgDbMock,
    getQueryableTextBlockContentMock,
    getUserHeaderByIdDbMock,
} from './queryController.test.mocks';

export type CardConfig = { id: UID; name: string; number: number; content?: string };
export type BoardConfig = { id: UID; name: string; code: string; cards?: CardConfig[] };
export type DocumentConfig = { id: UID; name: string; content?: string };
export type UserConfig = { id: UserId; firstName: string; lastName: string; username: string };

export const makeUid = (suffix: number | string): UID => {
    return `00000000-0000-0000-0000-${String(suffix).padStart(12, '0')}` as UID;
};

export const makeUserHeader = (user: UserConfig): UserHeader => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    profilePicture: '',
});

const buildModuleHeader = (orgId: OrganizationId, name: string, id: UID, type: TrzModuleType) => {
    return {
        id,
        parentId: makeUid('root'),
        name,
        type,
        order: 0,
        archived: false,
        createdAt: Date.now(),
        orgId,
        desiredPermissions: {},
        effectivePermissions: {},
        public: false,
    };
};

const configureSearchMocks = (data: {
    orgId: OrganizationId;
    boards?: BoardConfig[];
    documents?: DocumentConfig[];
}) => {
    const { orgId } = data;
    const boards = data.boards ?? [];
    const documents = data.documents ?? [];

    const boardModules = boards.map((board) => buildModuleHeader(orgId, board.name, board.id, TrzModuleType.Board));
    const documentModules = documents.map((doc) => buildModuleHeader(orgId, doc.name, doc.id, TrzModuleType.Document));

    const textBlockContent = new Map<UID, string>();
    const boardMap = new Map<UID, { id: UID; boardCode: string }>();
    const cardsByBoard = new Map<UID, any[]>();
    const documentsById = new Map<UID, any>();

    for (const board of boards) {
        boardMap.set(board.id, { id: board.id, boardCode: board.code });
        const cards = (board.cards ?? []).map((card) => {
            const descriptionTextBlockId = makeUid(`tb-card-${card.id}`);
            textBlockContent.set(descriptionTextBlockId, card.content ?? '');
            return {
                id: card.id,
                name: card.name,
                cardNumber: card.number,
                descriptionTextBlockId,
            };
        });
        cardsByBoard.set(board.id, cards);
    }

    for (const doc of documents) {
        const textBlockId = makeUid(`tb-doc-${doc.id}`);
        textBlockContent.set(textBlockId, doc.content ?? '');
        documentsById.set(doc.id, {
            id: doc.id,
            textBlockId,
        });
    }

    getOrgByIdDbMock.mockImplementation(async (id: OrganizationId) => {
        if (id !== orgId) return undefined;
        return {
            id: orgId,
            name: 'Org',
            createdAt: Date.now(),
            logoUrl: '',
            description: '',
            ownerId: makeUid('owner-1') as UserId,
        };
    });

    getModulesByOrgIdDbMock.mockImplementation(async (id: OrganizationId, filter: { type: TrzModuleType }) => {
        if (id !== orgId) return [];
        if (filter.type === TrzModuleType.Board) return boardModules;
        if (filter.type === TrzModuleType.Document) return documentModules;
        return [];
    });

    getBoardByIdDbMock.mockImplementation(async (id: UID) => boardMap.get(id));
    getCardsByBoardIdDbMock.mockImplementation(async (boardId: UID) => cardsByBoard.get(boardId) ?? []);
    getDocumentByIdDbMock.mockImplementation(async (id: UID) => documentsById.get(id));
    getQueryableTextBlockContentMock.mockImplementation(
        async (textBlockId: UID) => textBlockContent.get(textBlockId) ?? ''
    );
};

const configureTagMocks = (data: {
    orgId: OrganizationId;
    boards?: BoardConfig[];
    documents?: DocumentConfig[];
    users?: UserConfig[];
}) => {
    const { orgId } = data;
    const boards = data.boards ?? [];
    const documents = data.documents ?? [];
    const users = data.users ?? [];

    const boardModules = boards.map((board) => buildModuleHeader(orgId, board.name, board.id, TrzModuleType.Board));
    const documentModules = documents.map((doc) => buildModuleHeader(orgId, doc.name, doc.id, TrzModuleType.Document));

    const boardMap = new Map<UID, { id: UID; boardCode: string }>();
    const cardsByBoard = new Map<UID, any[]>();
    const userHeaders = new Map<UserId, UserHeader>();

    for (const board of boards) {
        boardMap.set(board.id, { id: board.id, boardCode: board.code });
        const cards = (board.cards ?? []).map((card) => ({
            id: card.id,
            name: card.name,
            cardNumber: card.number,
        }));
        cardsByBoard.set(board.id, cards);
    }

    for (const user of users) {
        userHeaders.set(user.id, makeUserHeader(user));
    }

    getOrgByIdDbMock.mockImplementation(async (id: OrganizationId) => {
        if (id !== orgId) return undefined;
        return {
            id: orgId,
            name: 'Org',
            createdAt: Date.now(),
            logoUrl: '',
            description: '',
            ownerId: makeUid('owner-1') as UserId,
        };
    });

    getModulesByOrgIdDbMock.mockImplementation(async (id: OrganizationId, filter: { type: TrzModuleType }) => {
        if (id !== orgId) return [];
        if (filter.type === TrzModuleType.Board) return boardModules;
        if (filter.type === TrzModuleType.Document) return documentModules;
        return [];
    });

    getBoardByIdDbMock.mockImplementation(async (id: UID) => boardMap.get(id));
    getCardsByBoardIdDbMock.mockImplementation(async (boardId: UID) => cardsByBoard.get(boardId) ?? []);
    getOrganizationMembershipsForOrgDbMock.mockImplementation(async (id: OrganizationId) => {
        if (id !== orgId) return [];
        return users.map((user) => ({
            userId: user.id,
            orgId,
            joinedAt: Date.now(),
        }));
    });
    getUserHeaderByIdDbMock.mockImplementation(async (id: UserId) => userHeaders.get(id));
};

export const buildSearchDatapoints = async (data: {
    orgId: OrganizationId;
    userId: UserId;
    boards?: BoardConfig[];
    documents?: DocumentConfig[];
}): Promise<QueryableDatapoint[]> => {
    configureSearchMocks({ orgId: data.orgId, boards: data.boards, documents: data.documents });
    return await getAllQueryableDataForUserInOrg(data.userId, data.orgId);
};

export const buildTagDatapoints = async (data: {
    orgId: OrganizationId;
    userId: UserId;
    boards?: BoardConfig[];
    documents?: DocumentConfig[];
    users?: UserConfig[];
}): Promise<QueryableDatapoint[]> => {
    configureTagMocks({
        orgId: data.orgId,
        boards: data.boards,
        documents: data.documents,
        users: data.users,
    });
    return await getQueryableTagsForUserInOrg(data.userId, data.orgId);
};

export const assertScoresAscending = (scores: number[]) => {
    for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
    }
};
