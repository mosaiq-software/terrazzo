import { File } from 'buffer';
import { BoardId, UID, UploadedFileId } from '../genericTypes';
import { UserHeader } from '../userTypes';
import { TrelloExportType } from './trelloTypes';

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
    USER_FAKE_DEV = '/user/dev-only-signin/:username',
    IMPORT_FROM_TRELLO = '/uploadtrello/:parentId',
    GET_FILE = '/file/:fileId',
    UPLOAD_FILE = '/file/upload',
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
    [RestRoutes.USER_FAKE_DEV]: RestMethods.POST,
    [RestRoutes.IMPORT_FROM_TRELLO]: RestMethods.POST,
    [RestRoutes.GET_FILE]: RestMethods.GET,
    [RestRoutes.UPLOAD_FILE]: RestMethods.POST,
};
export interface RestRequestParams {
    [RestRoutes.INDEX]: {};
    [RestRoutes.USER_GITHUB_AUTH]: { code: string };
    [RestRoutes.USER_GITHUB_DATA]: { access_token: string };
    [RestRoutes.USER_GITHUB_REVOKE_TOKEN]: { accessToken: string };
    [RestRoutes.USER_CHECK_USERNAME]: { username: string };
    [RestRoutes.USER_FAKE_DEV]: { username: string };
    [RestRoutes.IMPORT_FROM_TRELLO]: { parentId: UID };
    [RestRoutes.GET_FILE]: { fileId: UploadedFileId };
    [RestRoutes.UPLOAD_FILE]: {};
}

export interface RestRequestBody {
    [RestRoutes.INDEX]: undefined;
    [RestRoutes.USER_GITHUB_AUTH]: undefined;
    [RestRoutes.USER_GITHUB_DATA]: undefined;
    [RestRoutes.USER_GITHUB_REVOKE_TOKEN]: undefined;
    [RestRoutes.USER_CHECK_USERNAME]: undefined;
    [RestRoutes.USER_FAKE_DEV]: undefined;
    [RestRoutes.IMPORT_FROM_TRELLO]: TrelloExportType;
    [RestRoutes.GET_FILE]: undefined;
    [RestRoutes.UPLOAD_FILE]: { base64: string; fileName: string; mimeType: string };
}

export interface RestResponseTypes {
    [RestRoutes.INDEX]: string;
    [RestRoutes.USER_GITHUB_AUTH]: string;
    [RestRoutes.USER_GITHUB_DATA]: UserHeader | null;
    [RestRoutes.USER_GITHUB_REVOKE_TOKEN]: undefined;
    [RestRoutes.USER_CHECK_USERNAME]: boolean;
    [RestRoutes.USER_FAKE_DEV]: UserHeader;
    [RestRoutes.IMPORT_FROM_TRELLO]: BoardId | undefined;
    [RestRoutes.GET_FILE]: File;
    [RestRoutes.UPLOAD_FILE]: UploadedFileId;
}
export type ErrorString = string;
export type RestResponse<T extends RestRoutes> = RestResponseTypes[T] | ErrorString;
