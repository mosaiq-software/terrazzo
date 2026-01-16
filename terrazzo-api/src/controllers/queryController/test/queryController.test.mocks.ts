import { vi } from 'vitest';

export const getOrgByIdDbMock = vi.fn();
export const getModulesByOrgIdDbMock = vi.fn();
export const getBoardByIdDbMock = vi.fn();
export const getCardsByBoardIdDbMock = vi.fn();
export const getDocumentByIdDbMock = vi.fn();
export const getOrganizationMembershipsForOrgDbMock = vi.fn();
export const getUserHeaderByIdDbMock = vi.fn();
export const getQueryableTextBlockContentMock = vi.fn();

vi.mock('@trz-api/persistence/organizationPersistence', () => ({
    getOrgByIdDb: getOrgByIdDbMock,
}));

vi.mock('@trz-api/persistence/modulePersistence', () => ({
    getModulesByOrgIdDb: getModulesByOrgIdDbMock,
}));

vi.mock('@trz-api/persistence/boardPersistence', () => ({
    getBoardByIdDb: getBoardByIdDbMock,
}));

vi.mock('@trz-api/persistence/cardPersistence', () => ({
    getCardsByBoardIdDb: getCardsByBoardIdDbMock,
}));

vi.mock('@trz-api/persistence/documentPersistence', () => ({
    getDocumentByIdDb: getDocumentByIdDbMock,
}));

vi.mock('@trz-api/persistence/organizationMembershipPersistence', () => ({
    getOrganizationMembershipsForOrgDb: getOrganizationMembershipsForOrgDbMock,
}));

vi.mock('@trz-api/persistence/userPersistence', () => ({
    getUserHeaderByIdDb: getUserHeaderByIdDbMock,
}));

vi.mock('@trz-api/controllers/textBlockController/textBlockController', () => ({
    getQueryableTextBlockContent: getQueryableTextBlockContentMock,
}));

vi.mock('@trz-api/controllers/queryController/indexers/tagQueryIndexer', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../indexers/tagQueryIndexer')>();
    return {
        ...actual,
        getQueryableTagsForUserInOrg: async (...args: Parameters<typeof actual.getQueryableTagsForUserInOrg>) => {
            const data = await actual.getQueryableTagsForUserInOrg(...args);
            return data.map((item) => ({ ...item, name: item.display }));
        },
    };
});
