import { TrelloExportType } from './trelloTypes';
import { BoardId, GithubUserProfile, ProjectId, User, UserHeader, UserId } from './types';

/**
 * Data types for the REST API
 * Each route is named as its method, then a summary of its url / function
 * eg: PATCH_UPDATE_ACCOUNT_DATA -> app.patch("account/update/:id");
 */
export enum RestRoutes {
    INDEX = '/',
    USER_GITHUB_AUTH = '/user/github/auth/:code',
    USER_GITHUB_DATA = '/user/github/userdata/:access_token',
    USER_GITHUB_REVOKE_TOKEN = '/user/github/revoke/:accessToken',
    USER_CHECK_USERNAME = '/user/check-username/:username',
    USER_SETUP = '/user/setup/:id',
    IMPORT_FROM_TRELLO = '/uploadtrello/:projectId',
}

export enum RestMethods {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH',
    PUT = 'PUT',
    DELETE = 'DELETE',
}
export const RestRequestMethod = {
    [RestRoutes.INDEX]: RestMethods.GET,
    [RestRoutes.USER_GITHUB_AUTH]: RestMethods.GET,
    [RestRoutes.USER_GITHUB_DATA]: RestMethods.GET,
    [RestRoutes.USER_GITHUB_REVOKE_TOKEN]: RestMethods.DELETE,
    [RestRoutes.USER_CHECK_USERNAME]: RestMethods.GET,
    [RestRoutes.USER_SETUP]: RestMethods.POST,
    [RestRoutes.IMPORT_FROM_TRELLO]: RestMethods.POST,
};
export interface RestRequestParams {
    [RestRoutes.INDEX]: {};
    [RestRoutes.USER_GITHUB_AUTH]: { code: string };
    [RestRoutes.USER_GITHUB_DATA]: { access_token: string };
    [RestRoutes.USER_GITHUB_REVOKE_TOKEN]: { accessToken: string };
    [RestRoutes.USER_CHECK_USERNAME]: { username: string };
    [RestRoutes.USER_SETUP]: { id: string };
    [RestRoutes.IMPORT_FROM_TRELLO]: { projectId: ProjectId };
}

export interface RestRequestBody {
    [RestRoutes.INDEX]: undefined;
    [RestRoutes.USER_GITHUB_AUTH]: undefined;
    [RestRoutes.USER_GITHUB_DATA]: undefined;
    [RestRoutes.USER_GITHUB_REVOKE_TOKEN]: undefined;
    [RestRoutes.USER_CHECK_USERNAME]: undefined;
    [RestRoutes.USER_SETUP]: { username: string; firstName: string; lastName: string };
    [RestRoutes.IMPORT_FROM_TRELLO]: TrelloExportType;
}

export interface RestResponseTypes {
    [RestRoutes.INDEX]: string;
    [RestRoutes.USER_GITHUB_AUTH]: string;
    [RestRoutes.USER_GITHUB_DATA]: UserHeader | null;
    [RestRoutes.USER_GITHUB_REVOKE_TOKEN]: undefined;
    [RestRoutes.USER_CHECK_USERNAME]: boolean;
    [RestRoutes.USER_SETUP]: UserHeader;
    [RestRoutes.IMPORT_FROM_TRELLO]: BoardId | undefined;
}
export type ErrorString = string;
export type RestResponse<T extends RestRoutes> = RestResponseTypes[T] | ErrorString;
