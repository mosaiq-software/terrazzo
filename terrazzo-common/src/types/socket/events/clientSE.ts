import { CollectionSource } from '../../dataSource/collectionSources';
import {
    CollectionSourceData,
    CreateObjectSourceData,
    EditableCollectionSource,
    ObjectSourceData,
    UpdateObjectSourceData,
} from '../../dataSource/dataSourceTypes';
import { ObjectSource } from '../../dataSource/objectSources';
import { CardId, InviteId, ListId, OrganizationId, UID, UploadedFileId, UserId } from '../../genericTypes';
import { LinkedAccount, LinkedAccountProvider } from '../../linkedAccountTypes';
import { QueryItem } from '../../queryTypes';
import { TextBlockResourceType } from '../../textTypes';
import { MouseRoomUserData, RoomId } from '../roomTypes';
import { UserData } from '../socketTypes';

// CLIENT SOCKET EVENTS
export enum ClientSE {
    // Client to Server
    JOIN_ROOM = 'JOIN_ROOM',
    LEAVE_ROOM = 'LEAVE_ROOM',
    MOUSE_MOVE = 'MOUSE_MOVE',
    USER_IDLE = 'USER_IDLE',
    MOVE_LIST = 'MOVE_LIST',
    MOVE_CARD = 'MOVE_CARD',
    LOGOUT = 'LOGOUT',

    GET_SEARCH_RESULTS = 'GET_SEARCH_RESULTS',
    GET_SEARCH_TAGS = 'GET_SEARCH_TAGS',
    GET_USERS_LINKED_ACCOUNTS = 'GET_USERS_LINKED_ACCOUNTS',
    GET_USERNAME_AVAILABLE = 'GET_USERNAME_AVAILABLE',

    CREATE_DUPLICATE_CARD = 'CREATE_DUPLICATE_CARD',
    CREATE_FILE_UPLOAD = 'CREATE_FILE_UPLOAD',

    DELETE_USER_LINKED_ACCOUNT = 'DELETE_USER_LINKED_ACCOUNT',

    USE_INVITE = 'USE_INVITE',
    USE_TEXT_BLOCK_HISTORY_SNAPSHOT = 'USE_TEXT_BLOCK_HISTORY_SNAPSHOT',

    READ_OBJECT_SOURCE = 'READ_OBJECT_SOURCE',
    CREATE_OBJECT_SOURCE = 'CREATE_OBJECT_SOURCE',
    UPDATE_OBJECT_SOURCE = 'UPDATE_OBJECT_SOURCE',
    READ_COLLECTION_SOURCE = 'READ_COLLECTION_SOURCE',
    ADD_TO_COLLECTION_SOURCE = 'ADD_TO_COLLECTION_SOURCE',
    REMOVE_FROM_COLLECTION_SOURCE = 'REMOVE_FROM_COLLECTION_SOURCE',
}
export interface ClientSEPayload {
    // Client to Server
    [ClientSE.JOIN_ROOM]: RoomId;
    [ClientSE.LEAVE_ROOM]: RoomId;
    [ClientSE.MOUSE_MOVE]: MouseRoomUserData;
    [ClientSE.USER_IDLE]: boolean;
    [ClientSE.MOVE_LIST]: { listId: ListId; position: number | null };
    [ClientSE.MOVE_CARD]: { cardId: CardId; toList: ListId; position?: number | null };
    [ClientSE.LOGOUT]: undefined;

    [ClientSE.GET_SEARCH_RESULTS]: { query: string; searchSessionId: string; orgId: OrganizationId };
    [ClientSE.GET_SEARCH_TAGS]: { query: string; searchSessionId: string; orgId: OrganizationId };
    [ClientSE.GET_USERS_LINKED_ACCOUNTS]: UserId;
    [ClientSE.GET_USERNAME_AVAILABLE]: string;

    [ClientSE.CREATE_DUPLICATE_CARD]: { cardId: CardId };
    [ClientSE.CREATE_FILE_UPLOAD]: { fileName: string; base64: string; mimeType: string };

    [ClientSE.DELETE_USER_LINKED_ACCOUNT]: { userId: UserId; provider: LinkedAccountProvider; accountId: string };

    [ClientSE.USE_INVITE]: { inviteId: InviteId };
    [ClientSE.USE_TEXT_BLOCK_HISTORY_SNAPSHOT]: {
        snapshotId: UID;
        resourceId: UID;
        resourceType: TextBlockResourceType;
    };

    [ClientSE.READ_OBJECT_SOURCE]: { source: ObjectSource; id: UID };
    [ClientSE.CREATE_OBJECT_SOURCE]: { data: CreateObjectSourceData };
    [ClientSE.UPDATE_OBJECT_SOURCE]: { id: UID; data: UpdateObjectSourceData };
    [ClientSE.READ_COLLECTION_SOURCE]: { source: CollectionSource; id: string };
    [ClientSE.ADD_TO_COLLECTION_SOURCE]: { source: EditableCollectionSource; collectionId: string; itemIds: UID[] };
    [ClientSE.REMOVE_FROM_COLLECTION_SOURCE]: {
        source: EditableCollectionSource;
        collectionId: string;
        itemIds: UID[];
    };
}
export interface ClientSEReplies {
    // Client to Server req - Server to Client callback
    [ClientSE.JOIN_ROOM]: UserData[];
    [ClientSE.LEAVE_ROOM]: undefined;
    [ClientSE.MOUSE_MOVE]: undefined;
    [ClientSE.USER_IDLE]: undefined;
    [ClientSE.MOVE_LIST]: undefined;
    [ClientSE.MOVE_CARD]: undefined;
    [ClientSE.LOGOUT]: undefined;

    [ClientSE.GET_SEARCH_RESULTS]: { results: QueryItem[] } | undefined;
    [ClientSE.GET_SEARCH_TAGS]: { results: QueryItem[] } | undefined;
    [ClientSE.GET_USERS_LINKED_ACCOUNTS]: LinkedAccount[] | undefined;
    [ClientSE.GET_USERNAME_AVAILABLE]: boolean;

    [ClientSE.CREATE_DUPLICATE_CARD]: CardId | undefined;
    [ClientSE.CREATE_FILE_UPLOAD]: UploadedFileId | undefined;

    [ClientSE.DELETE_USER_LINKED_ACCOUNT]: undefined;

    [ClientSE.USE_INVITE]: boolean;
    [ClientSE.USE_TEXT_BLOCK_HISTORY_SNAPSHOT]: boolean;

    [ClientSE.READ_OBJECT_SOURCE]: ObjectSourceData | undefined;
    [ClientSE.CREATE_OBJECT_SOURCE]: undefined;
    [ClientSE.UPDATE_OBJECT_SOURCE]: undefined;
    [ClientSE.READ_COLLECTION_SOURCE]: CollectionSourceData | undefined;
    [ClientSE.ADD_TO_COLLECTION_SOURCE]: undefined;
    [ClientSE.REMOVE_FROM_COLLECTION_SOURCE]: undefined;
}
export type ClientSEReply<T extends ClientSE> = (payload: ClientSEReplies[T], error?: string) => void;
