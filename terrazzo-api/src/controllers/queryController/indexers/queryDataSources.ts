import { userHandler } from '@trz-api/controllers/dataSources/objectHandlers/user';
import { getModuleById } from '@trz-api/controllers/moduleQueries';
import { getTextBlocksAsPlaintext } from '@trz-api/controllers/textBlockController/textBlockController';
import { getActiveCardsByBoardIdDb } from '@trz-api/persistence/cardPersistence';
import { getModulesByOrgIdDb } from '@trz-api/persistence/modulePersistence';
import { getOrganizationMembershipsForOrgDb } from '@trz-api/persistence/organizationMembershipPersistence';

// Search

export interface SearchQueryDataSource {
    getModulesByOrgIdDb: typeof getModulesByOrgIdDb;
    getModuleById: typeof getModuleById;
    getActiveCardsByBoardIdDb: typeof getActiveCardsByBoardIdDb;
    getOrganizationMembershipsForOrgDb: typeof getOrganizationMembershipsForOrgDb;
    getQueryableTextBlockContent: typeof getTextBlocksAsPlaintext;
}

export const defaultSearchQueryDataSource: SearchQueryDataSource = {
    getModulesByOrgIdDb: getModulesByOrgIdDb,
    getModuleById: getModuleById,
    getActiveCardsByBoardIdDb: getActiveCardsByBoardIdDb,
    getOrganizationMembershipsForOrgDb: getOrganizationMembershipsForOrgDb,
    getQueryableTextBlockContent: getTextBlocksAsPlaintext,
};

// Tags

export interface TagsQueryDataSource {
    getModulesByOrgIdDb: typeof getModulesByOrgIdDb;
    getModuleById: typeof getModuleById;
    getActiveCardsByBoardIdDb: typeof getActiveCardsByBoardIdDb;
    getOrganizationMembershipsForOrgDb: typeof getOrganizationMembershipsForOrgDb;
    userHandler: typeof userHandler;
}

export const defaultTagsQueryDataSource: TagsQueryDataSource = {
    getModulesByOrgIdDb: getModulesByOrgIdDb,
    getModuleById: getModuleById,
    getActiveCardsByBoardIdDb: getActiveCardsByBoardIdDb,
    getOrganizationMembershipsForOrgDb: getOrganizationMembershipsForOrgDb,
    userHandler: userHandler,
};
