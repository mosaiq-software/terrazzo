import { getTextBlocksAsPlaintext } from '@trz-api/controllers/textBlockController/textBlockController';
import { getBoardByIdDb } from '@trz-api/persistence/boardPersistence';
import { getCardsByBoardIdDb } from '@trz-api/persistence/cardPersistence';
import { getDocumentByIdDb } from '@trz-api/persistence/documentPersistence';
import { getModulesByOrgIdDb } from '@trz-api/persistence/modulePersistence';
import { getOrganizationMembershipsForOrgDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { getUserHeaderByIdDb } from '@trz-api/persistence/userPersistence';

// Search

export interface SearchQueryDataSource {
    getModulesByOrgIdDb: typeof getModulesByOrgIdDb;
    getBoardByIdDb: typeof getBoardByIdDb;
    getCardsByBoardIdDb: typeof getCardsByBoardIdDb;
    getOrganizationMembershipsForOrgDb: typeof getOrganizationMembershipsForOrgDb;
    getDocumentByIdDb: typeof getDocumentByIdDb;
    getQueryableTextBlockContent: typeof getTextBlocksAsPlaintext;
}

export const defaultSearchQueryDataSource: SearchQueryDataSource = {
    getModulesByOrgIdDb: getModulesByOrgIdDb,
    getBoardByIdDb: getBoardByIdDb,
    getCardsByBoardIdDb: getCardsByBoardIdDb,
    getOrganizationMembershipsForOrgDb: getOrganizationMembershipsForOrgDb,
    getDocumentByIdDb: getDocumentByIdDb,
    getQueryableTextBlockContent: getTextBlocksAsPlaintext,
};

// Tags

export interface TagsQueryDataSource {
    getModulesByOrgIdDb: typeof getModulesByOrgIdDb;
    getBoardByIdDb: typeof getBoardByIdDb;
    getCardsByBoardIdDb: typeof getCardsByBoardIdDb;
    getOrganizationMembershipsForOrgDb: typeof getOrganizationMembershipsForOrgDb;
    getUserHeaderByIdDb: typeof getUserHeaderByIdDb;
}

export const defaultTagsQueryDataSource: TagsQueryDataSource = {
    getModulesByOrgIdDb: getModulesByOrgIdDb,
    getBoardByIdDb: getBoardByIdDb,
    getCardsByBoardIdDb: getCardsByBoardIdDb,
    getOrganizationMembershipsForOrgDb: getOrganizationMembershipsForOrgDb,
    getUserHeaderByIdDb: getUserHeaderByIdDb,
};
