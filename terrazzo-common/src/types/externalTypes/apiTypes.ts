import { AuthProviderCallbackData, AuthSession, ExistingAuthToken } from '../authTypes';
import { BoardId, UID, UploadedFileId } from '../genericTypes';
import { TrelloExportType } from './trelloTypes';

/**
 * Data types for the REST API
 * Each route is named as its method, then a summary of its url / function
 * eg: PATCH_UPDATE_ACCOUNT_DATA -> app.patch("account/update/:id");
 */
export enum RestRoutes {
    INDEX = '/',
    USER_CHECK_USERNAME = '/user/check-username/:username',
    USER_FAKE_DEV = '/user/dev-only-signin/:username',
    IMPORT_FROM_TRELLO = '/uploadtrello/:parentId',
    GET_FILE = '/file/:fileId',
    UPLOAD_FILE = '/file/upload',
    AUTH_PROVIDER_CALLBACK = '/auth/callback',
    EXISTING_AUTH = '/auth/existing',
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
    [RestRoutes.USER_CHECK_USERNAME]: RestMethods.GET,
    [RestRoutes.USER_FAKE_DEV]: RestMethods.POST,
    [RestRoutes.IMPORT_FROM_TRELLO]: RestMethods.POST,
    [RestRoutes.GET_FILE]: RestMethods.GET,
    [RestRoutes.UPLOAD_FILE]: RestMethods.POST,
    [RestRoutes.AUTH_PROVIDER_CALLBACK]: RestMethods.POST,
    [RestRoutes.EXISTING_AUTH]: RestMethods.POST,
};
export interface RestRequestParams {
    [RestRoutes.INDEX]: {};
    [RestRoutes.USER_CHECK_USERNAME]: { username: string };
    [RestRoutes.USER_FAKE_DEV]: { username: string };
    [RestRoutes.IMPORT_FROM_TRELLO]: { parentId: UID };
    [RestRoutes.GET_FILE]: { fileId: UploadedFileId };
    [RestRoutes.UPLOAD_FILE]: {};
    [RestRoutes.AUTH_PROVIDER_CALLBACK]: {};
    [RestRoutes.EXISTING_AUTH]: {};
}

export interface RestRequestBody {
    [RestRoutes.INDEX]: undefined;
    [RestRoutes.USER_CHECK_USERNAME]: undefined;
    [RestRoutes.USER_FAKE_DEV]: undefined;
    [RestRoutes.IMPORT_FROM_TRELLO]: TrelloExportType;
    [RestRoutes.GET_FILE]: undefined;
    [RestRoutes.UPLOAD_FILE]: { base64: string; fileName: string; mimeType: string };
    [RestRoutes.AUTH_PROVIDER_CALLBACK]: AuthProviderCallbackData;
    [RestRoutes.EXISTING_AUTH]: ExistingAuthToken;
}

export interface RestResponseTypes {
    [RestRoutes.INDEX]: string;
    [RestRoutes.USER_CHECK_USERNAME]: boolean;
    [RestRoutes.USER_FAKE_DEV]: AuthSession;
    [RestRoutes.IMPORT_FROM_TRELLO]: BoardId | undefined;
    [RestRoutes.GET_FILE]: Buffer<ArrayBuffer>;
    [RestRoutes.UPLOAD_FILE]: UploadedFileId;
    [RestRoutes.AUTH_PROVIDER_CALLBACK]: AuthSession | 'already-linked';
    [RestRoutes.EXISTING_AUTH]: AuthSession | 'unauthorized';
}
export type ErrorString = string;
export type RestResponse<T extends RestRoutes> = RestResponseTypes[T];
