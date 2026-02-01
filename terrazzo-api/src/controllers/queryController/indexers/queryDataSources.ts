import { getTextBlocksAsPlaintext } from '@trz-api/controllers/textBlockController/textBlockController';
import { getUserHeader } from '@trz-api/controllers/userController';
import { getBoardByIdDb } from '@trz-api/persistence/boardPersistence';
import { getActiveCardsByBoardIdDb } from '@trz-api/persistence/cardPersistence';
import { getDocumentByIdDb } from '@trz-api/persistence/documentPersistence';
import { getModulesByOrgIdDb } from '@trz-api/persistence/modulePersistence';
import { getOrganizationMembershipsForOrgDb } from '@trz-api/persistence/organizationMembershipPersistence';

// Search

export interface SearchQueryDataSource {
    getModulesByOrgIdDb: typeof getModulesByOrgIdDb;
    getBoardByIdDb: typeof getBoardByIdDb;
    getActiveCardsByBoardIdDb: typeof getActiveCardsByBoardIdDb;
    getOrganizationMembershipsForOrgDb: typeof getOrganizationMembershipsForOrgDb;
    getDocumentByIdDb: typeof getDocumentByIdDb;
    getQueryableTextBlockContent: typeof getTextBlocksAsPlaintext;
}

export const defaultSearchQueryDataSource: SearchQueryDataSource = {
    getModulesByOrgIdDb: getModulesByOrgIdDb,
    getBoardByIdDb: getBoardByIdDb,
    getActiveCardsByBoardIdDb: getActiveCardsByBoardIdDb,
    getOrganizationMembershipsForOrgDb: getOrganizationMembershipsForOrgDb,
    getDocumentByIdDb: getDocumentByIdDb,
    getQueryableTextBlockContent: getTextBlocksAsPlaintext,
};

// Tags

export interface TagsQueryDataSource {
    getModulesByOrgIdDb: typeof getModulesByOrgIdDb;
    getBoardByIdDb: typeof getBoardByIdDb;
    getActiveCardsByBoardIdDb: typeof getActiveCardsByBoardIdDb;
    getOrganizationMembershipsForOrgDb: typeof getOrganizationMembershipsForOrgDb;
    getUserHeader: typeof getUserHeader;
}

export const defaultTagsQueryDataSource: TagsQueryDataSource = {
    getModulesByOrgIdDb: getModulesByOrgIdDb,
    getBoardByIdDb: getBoardByIdDb,
    getActiveCardsByBoardIdDb: getActiveCardsByBoardIdDb,
    getOrganizationMembershipsForOrgDb: getOrganizationMembershipsForOrgDb,
    getUserHeader: getUserHeader,
};
