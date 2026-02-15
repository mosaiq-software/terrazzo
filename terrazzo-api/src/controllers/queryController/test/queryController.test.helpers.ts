import {
    CardHeader,
    exhaustiveCheck,
    fixedTimestamp,
    ModuleData,
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
// export type TestModuleConfig<T extends TrzModuleType> = { id: UID; name: string; } & ;
export type TestUserConfig = { id: UserId; firstName: string; lastName: string; username: string };

export const makeUid = (suffix: number | string): UID => {
    return `00000000-0000-0000-0000-${String(suffix).padStart(12, '0')}` as UID;
};

const buildModuleHeader = <T extends TrzModuleType>(
    orgId: OrganizationId,
    name: string,
    id: UID,
    type: T
): ModuleHeader<T> => {
    let data: ModuleData<T>;
    switch (type) {
        case TrzModuleType.Directory:
            data = {} as ModuleData<T>;
            break;
        case TrzModuleType.Board:
            data = { boardCode: `abc` } as ModuleData<T>;
            break;
        case TrzModuleType.Document:
            data = { textBlockId: makeUid('text') } as ModuleData<T>;
            break;
        case TrzModuleType.Organization:
            throw new Error('Organization modules are not supported in this test helper');
        default:
            exhaustiveCheck(type);
    }
    return {
        id,
        parentId: makeUid('root'),
        name,
        type,
        order: 0,
        archived: false,
        createdAt: fixedTimestamp(),
        orgId,
        desiredPermissions: {},
        effectivePermissions: {},
        public: false,
        data,
    };
};

export const buildSearchDataSource = (data: {
    orgId: OrganizationId;
    boards?: TestBoardConfig[];
    documents?: TestDocumentConfig[];
}): SearchQueryDataSource => {
    const { orgId, boards = [], documents = [] } = data;

    const boardModules = boards.map((board) => buildModuleHeader(orgId, board.name, board.id, TrzModuleType.Board));
    const documentModules = documents.map((doc) => buildModuleHeader(orgId, doc.name, doc.id, TrzModuleType.Document));

    const textBlockContent = new Map<TextBlockId, string>();
    const moduleMap = new Map<ModuleId, ModuleHeader>();
    const cardsByBoard = new Map<ModuleId, CardHeader[]>();

    for (const board of boards) {
        boardMap.set(board.id, { id: board.id, boardCode: board.code });
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

    for (const doc of documents) {
        const textBlockId = makeUid(`tb-doc-${doc.id}`);
        textBlockContent.set(textBlockId, doc.content ?? '');
        documentsById.set(doc.id, {
            id: doc.id,
            textBlockId,
            lastModifiedAt: fixedTimestamp(),
            lastModifiedByUserId: UID0,
        });
    }

    return {
        getModulesByOrgIdDb: async (id, filter) => {
            if (id !== orgId) return [];
            if (!filter) return [];
            if (filter.type === TrzModuleType.Board) return boardModules;
            if (filter.type === TrzModuleType.Document) return documentModules;
            return [];
        },
        getModuleById: async (id) => boardMap.get(id),
        getActiveCardsByBoardIdDb: async (boardId) => cardsByBoard.get(boardId) ?? [],
        getOrganizationMembershipsForOrgDb: async () => [],
        getQueryableTextBlockContent: async (textBlockId) => textBlockContent.get(textBlockId) ?? '',
    };
};
