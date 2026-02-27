import { CollectionSource } from '../../dataSource/collectionSources';
import {
    CollectionSourceData,
    CreateObjectSourceData,
    EditableCollectionSource,
    ObjectSourceData,
    UpdateObjectSourceData,
} from '../../dataSource/dataSourceTypes';
import { ObjectSource } from '../../dataSource/objectSources';
import {
    CardId,
    InviteId,
    LabelId,
    ListId,
    ModuleId,
    OrganizationId,
    RoleId,
    UID,
    UploadedFileId,
    UserId,
} from '../../genericTypes';
import { Invite } from '../../inviteTypes';
import { LinkedAccount, LinkedAccountProvider } from '../../linkedAccountTypes';
import { OrganizationHeader } from '../../organizationTypes';
import { Role } from '../../permissions/roleTypes';
import { QueryItem } from '../../queryTypes';
import { TextBlockSnapshot } from '../../textSnapshotTypes';
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

    GET_USERS_ORGANIZATIONS = 'GET_USERS_ORGANIZATIONS',
    GET_SEARCH_RESULTS = 'GET_SEARCH_RESULTS',
    GET_SEARCH_TAGS = 'GET_SEARCH_TAGS',
    GET_INVITES_FOR_ORG = 'GET_INVITES_FOR_ORG',
    GET_ORGANIZATION_MEMBERSHIPS = 'GET_ORGANIZATION_MEMBERSHIPS',
    GET_ROLES_FOR_ORG = 'GET_ROLES_FOR_ORG',
    GET_ROLES_FOR_USER_IN_ORG = 'GET_ROLES_FOR_USER_IN_ORG',
    GET_USERS_LINKED_ACCOUNTS = 'GET_USERS_LINKED_ACCOUNTS',
    GET_USERNAME_AVAILABLE = 'GET_USERNAME_AVAILABLE',
    GET_TEXT_BLOCK_HISTORY_SNAPSHOTS = 'GET_TEXT_BLOCK_HISTORY_SNAPSHOTS',
    GET_MODULE_CHILDREN = 'GET_MODULE_CHILDREN',
    GET_MODULE_LABELS = 'GET_MODULE_LABELS',

    CREATE_DUPLICATE_CARD = 'CREATE_DUPLICATE_CARD',
    CREATE_FILE_UPLOAD = 'CREATE_FILE_UPLOAD',

    UPDATE_CARD_ASSIGNEE = 'UPDATE_CARD_ASSIGNEE',
    UPDATE_CARDS_LABELS = 'UPDATE_CARDS_LABELS',
    UPDATE_ROLES_FOR_USER_IN_ORG = 'UPDATE_ROLES_FOR_USER_IN_ORG',

    DELETE_MEMBERSHIP = 'DELETE_MEMBERSHIP',
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

    [ClientSE.GET_USERS_ORGANIZATIONS]: UserId;
    [ClientSE.GET_SEARCH_RESULTS]: { query: string; searchSessionId: string; orgId: OrganizationId };
    [ClientSE.GET_SEARCH_TAGS]: { query: string; searchSessionId: string; orgId: OrganizationId };
    [ClientSE.GET_INVITES_FOR_ORG]: OrganizationId;
    [ClientSE.GET_ORGANIZATION_MEMBERSHIPS]: OrganizationId;
    [ClientSE.GET_ROLES_FOR_ORG]: OrganizationId;
    [ClientSE.GET_ROLES_FOR_USER_IN_ORG]: { userId: UserId; orgId: OrganizationId };
    [ClientSE.GET_USERS_LINKED_ACCOUNTS]: UserId;
    [ClientSE.GET_USERNAME_AVAILABLE]: string;
    [ClientSE.GET_TEXT_BLOCK_HISTORY_SNAPSHOTS]: { resourceId: UID; resourceType: TextBlockResourceType };
    [ClientSE.GET_MODULE_CHILDREN]: ModuleId;
    [ClientSE.GET_MODULE_LABELS]: ModuleId;

    [ClientSE.CREATE_DUPLICATE_CARD]: { cardId: CardId };
    [ClientSE.CREATE_FILE_UPLOAD]: { fileName: string; base64: string; mimeType: string };

    [ClientSE.UPDATE_CARD_ASSIGNEE]: { cardId: CardId; userId: UserId; assigned: boolean };
    [ClientSE.UPDATE_CARDS_LABELS]: { cardId: CardId; labelIds: LabelId[] };
    [ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG]: { userId: UserId; orgId: OrganizationId; roleIds: RoleId[] };

    [ClientSE.DELETE_MEMBERSHIP]: { userId: UserId; orgId: OrganizationId };
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
    [ClientSE.READ_COLLECTION_SOURCE]: { source: CollectionSource; id: UID };
    [ClientSE.ADD_TO_COLLECTION_SOURCE]: { source: EditableCollectionSource; collectionId: UID; itemIds: UID[] };
    [ClientSE.REMOVE_FROM_COLLECTION_SOURCE]: { source: EditableCollectionSource; collectionId: UID; itemIds: UID[] };
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

    [ClientSE.GET_USERS_ORGANIZATIONS]: OrganizationHeader[];
    [ClientSE.GET_SEARCH_RESULTS]: { results: QueryItem[] } | undefined;
    [ClientSE.GET_SEARCH_TAGS]: { results: QueryItem[] } | undefined;
    [ClientSE.GET_INVITES_FOR_ORG]: Invite[] | undefined;
    [ClientSE.GET_ORGANIZATION_MEMBERSHIPS]: UserId[] | undefined;
    [ClientSE.GET_ROLES_FOR_ORG]: Role[] | undefined;
    [ClientSE.GET_ROLES_FOR_USER_IN_ORG]: RoleId[] | undefined;
    [ClientSE.GET_USERS_LINKED_ACCOUNTS]: LinkedAccount[] | undefined;
    [ClientSE.GET_USERNAME_AVAILABLE]: boolean;
    [ClientSE.GET_TEXT_BLOCK_HISTORY_SNAPSHOTS]: TextBlockSnapshot[] | undefined;
    [ClientSE.GET_MODULE_CHILDREN]: ModuleId[] | undefined;
    [ClientSE.GET_MODULE_LABELS]: LabelId[] | undefined;

    [ClientSE.CREATE_DUPLICATE_CARD]: CardId | undefined;
    [ClientSE.CREATE_FILE_UPLOAD]: UploadedFileId | undefined;

    [ClientSE.UPDATE_CARD_ASSIGNEE]: undefined;
    [ClientSE.UPDATE_CARDS_LABELS]: undefined;
    [ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG]: undefined;

    [ClientSE.DELETE_MEMBERSHIP]: undefined;
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
