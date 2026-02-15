import {
    CardHeader,
    fixedTimestamp,
    ModuleHeader,
    ModuleId,
    OrganizationId,
    TextBlockId,
    TrzModuleType,
    UID,
    UID0,
    UserId,
} from '@mosaiq/terrazzo-common';
import { SearchQueryDataSource } from '../indexers/queryDataSources';

export type TestCardConfig = { id: UID; name: string; number: number; content?: string };
export type TestBoardConfig = { id: UID; name: string; code: string; cards?: TestCardConfig[] };
export type TestDocumentConfig = { id: UID; name: string; content?: string };
export type TestUserConfig = { id: UserId; firstName: string; lastName: string; username: string };

export const makeUid = (suffix: number | string): UID => {
    return `00000000-0000-0000-0000-${String(suffix).padStart(12, '0')}` as UID;
};

const buildBoardModuleHeader = (
    orgId: OrganizationId,
    name: string,
    id: UID,
    boardCode: string
): ModuleHeader<TrzModuleType.Board> => {
    return {
        id,
        parentId: makeUid('root'),
        name,
        type: TrzModuleType.Board,
        order: 0,
        archived: false,
        createdAt: fixedTimestamp(),
        orgId,
        desiredPermissions: {},
        effectivePermissions: {},
        public: false,
        data: {
            boardCode,
        },
    };
};

const buildDocumentModuleHeader = (
    orgId: OrganizationId,
    name: string,
    id: UID,
    textBlockId: TextBlockId
): ModuleHeader<TrzModuleType.Document> => {
    return {
        id,
        parentId: makeUid('root'),
        name,
        type: TrzModuleType.Document,
        order: 0,
        archived: false,
        createdAt: fixedTimestamp(),
        orgId,
        desiredPermissions: {},
        effectivePermissions: {},
        public: false,
        data: {
            textBlockId,
            lastModifiedAt: fixedTimestamp(),
            lastModifiedByUserId: UID0,
        },
    };
};

export const buildSearchDataSource = (data: {
    orgId: OrganizationId;
    boards?: TestBoardConfig[];
    documents?: TestDocumentConfig[];
}): SearchQueryDataSource => {
    const { orgId, boards = [], documents = [] } = data;

    const textBlockContent = new Map<TextBlockId, string>();
    const moduleMap = new Map<ModuleId, ModuleHeader>();
    const cardsByBoard = new Map<ModuleId, CardHeader[]>();

    const boardModules = boards.map((board) => buildBoardModuleHeader(orgId, board.name, board.id, board.code));
    const documentModules = documents.map((doc) => {
        const textBlockId = makeUid(`tb-doc-${doc.id}`);
        textBlockContent.set(textBlockId, doc.content ?? '');
        return buildDocumentModuleHeader(orgId, doc.name, doc.id, textBlockId);
    });

    for (const mod of [...boardModules, ...documentModules]) {
        moduleMap.set(mod.id, mod);
    }

    for (const board of boards) {
        const cards = (board.cards ?? []).map((card, index) => {
            const descriptionTextBlockId = makeUid(`tb-card-${card.id}`);
            textBlockContent.set(descriptionTextBlockId, card.content ?? '');
            return {
                id: card.id,
                listId: makeUid(`list-${board.id}`),
                boardId: board.id,
                cardNumber: card.number,
                name: card.name,
                priority: null,
                storyPoints: null,
                archived: false,
                order: index,
                descriptionTextBlockId,
                createdAt: fixedTimestamp(),
                createdById: null,
            };
        });
        cardsByBoard.set(board.id, cards);
    }

    return {
        getModulesByOrgIdDb: async (id, filter) => {
            if (id !== orgId) return [];
            const all = [...boardModules, ...documentModules];
            if (!filter) return all;
            return all.filter((mod) => {
                if (filter.type && mod.type !== filter.type) return false;
                if (filter.archived !== undefined && mod.archived !== filter.archived) return false;
                return true;
            });
        },
        getModuleById: async (id, expectedType) => {
            const mod = moduleMap.get(id);
            if (!mod) return undefined;
            if (mod.type !== expectedType) {
                throw new Error(`Module with id ${id} is not of type ${expectedType}`);
            }
            return mod as any;
        },
        getActiveCardsByBoardIdDb: async (boardId) => cardsByBoard.get(boardId) ?? [],
        getOrganizationMembershipsForOrgDb: async () => [],
        getQueryableTextBlockContent: async (textBlockId) => textBlockContent.get(textBlockId) ?? '',
    };
};
