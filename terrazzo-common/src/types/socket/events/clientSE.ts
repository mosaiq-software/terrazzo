import { TextBlockResourceType, TextBlockSnapshot } from '../../..';
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
import { Label } from '../../modules/board/boardTypes';
import { Card } from '../../modules/board/cardTypes';
import { List, ListHeader } from '../../modules/board/listTypes';
import { ModuleDataMap, ModuleHeader, TrzModuleType } from '../../modules/moduleTypes';
import { Member, OrganizationHeader } from '../../organizationTypes';
import { Role } from '../../permissions/roleTypes';
import { QueryItem } from '../../queryTypes';
import { UserHeader } from '../../userTypes';
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
    GET_ORGANIZATION = 'GET_ORGANIZATION',
    GET_LIST = 'GET_LIST',
    GET_CARD = 'GET_CARD',
    GET_SEARCH_RESULTS = 'GET_SEARCH_RESULTS',
    GET_SEARCH_TAGS = 'GET_SEARCH_TAGS',
    GET_INVITES_FOR_ORG = 'GET_INVITES_FOR_ORG',
    GET_INVITE = 'GET_INVITE',
    GET_USER = 'GET_USER',
    GET_ORGANIZATION_MEMBERSHIPS = 'GET_ORGANIZATION_MEMBERSHIPS',
    GET_ROLES_FOR_ORG = 'GET_ROLES_FOR_ORG',
    GET_ROLES_FOR_USER_IN_ORG = 'GET_ROLES_FOR_USER_IN_ORG',
    GET_USERS_LINKED_ACCOUNTS = 'GET_USERS_LINKED_ACCOUNTS',
    GET_USERNAME_AVAILABLE = 'GET_USERNAME_AVAILABLE',
    GET_TEXT_BLOCK_HISTORY_SNAPSHOTS = 'GET_TEXT_BLOCK_HISTORY_SNAPSHOTS',
    GET_MODULE = 'GET_MODULE',
    GET_MODULE_CHILDREN = 'GET_MODULE_CHILDREN',

    CREATE_ORG = 'CREATE_ORG',
    CREATE_LIST = 'CREATE_LIST',
    CREATE_CARD = 'CREATE_CARD',
    CREATE_BOARD_LABEL = 'CREATE_BOARD_LABEL',
    CREATE_DUPLICATE_CARD = 'CREATE_DUPLICATE_CARD',
    CREATE_INVITE = 'CREATE_INVITE',
    CREATE_ROLE = 'CREATE_ROLE',
    CREATE_FILE_UPLOAD = 'CREATE_FILE_UPLOAD',
    CREATE_MODULE = 'CREATE_MODULE',

    UPDATE_USER_FIELD = 'UPDATE_USER_FIELD',
    UPDATE_ORG_FIELD = 'UPDATE_ORG_FIELD',
    UPDATE_LIST_FIELD = 'UPDATE_LIST_FIELD',
    UPDATE_CARD_FIELD = 'UPDATE_CARD_FIELD',
    UPDATE_CARD_ASSIGNEE = 'UPDATE_CARD_ASSIGNEE',
    UPDATE_BOARD_LABEL = 'UPDATE_BOARD_LABEL',
    UPDATE_CARDS_LABELS = 'UPDATE_CARDS_LABELS',
    UPDATE_ROLE = 'UPDATE_ROLE',
    UPDATE_ROLES_FOR_USER_IN_ORG = 'UPDATE_ROLES_FOR_USER_IN_ORG',
    UPDATE_MODULE_FIELD = 'UPDATE_MODULE_FIELD',

    DELETE_BOARD_LABEL = 'DELETE_BOARD_LABEL',
    DELETE_INVITE = 'DELETE_INVITE',
    DELETE_MEMBERSHIP = 'DELETE_MEMBERSHIP',
    DELETE_ROLE = 'DELETE_ROLE',
    DELETE_USER_LINKED_ACCOUNT = 'DELETE_USER_LINKED_ACCOUNT',

    USE_INVITE = 'USE_INVITE',
    USE_TEXT_BLOCK_HISTORY_SNAPSHOT = 'USE_TEXT_BLOCK_HISTORY_SNAPSHOT',
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
    [ClientSE.GET_ORGANIZATION]: OrganizationId;
    [ClientSE.GET_LIST]: ListId;
    [ClientSE.GET_CARD]: CardId;
    [ClientSE.GET_SEARCH_RESULTS]: { query: string; searchSessionId: string; orgId: OrganizationId };
    [ClientSE.GET_SEARCH_TAGS]: { query: string; searchSessionId: string; orgId: OrganizationId };
    [ClientSE.GET_INVITES_FOR_ORG]: OrganizationId;
    [ClientSE.GET_INVITE]: InviteId;
    [ClientSE.GET_USER]: UserId;
    [ClientSE.GET_ORGANIZATION_MEMBERSHIPS]: OrganizationId;
    [ClientSE.GET_ROLES_FOR_ORG]: OrganizationId;
    [ClientSE.GET_ROLES_FOR_USER_IN_ORG]: { userId: UserId; orgId: OrganizationId };
    [ClientSE.GET_USERS_LINKED_ACCOUNTS]: UserId;
    [ClientSE.GET_USERNAME_AVAILABLE]: string;
    [ClientSE.GET_TEXT_BLOCK_HISTORY_SNAPSHOTS]: { resourceId: UID; resourceType: TextBlockResourceType };
    [ClientSE.GET_MODULE]: ModuleId;
    [ClientSE.GET_MODULE_CHILDREN]: ModuleId;

    [ClientSE.CREATE_ORG]: { name: string };
    [ClientSE.CREATE_LIST]: { boardID: ModuleId; listName: string };
    [ClientSE.CREATE_CARD]: { listID: ListId; cardName: string };
    [ClientSE.CREATE_BOARD_LABEL]: { boardId: ModuleId; name: string; color: string };
    [ClientSE.CREATE_DUPLICATE_CARD]: { cardId: CardId };
    [ClientSE.CREATE_INVITE]: { orgId: OrganizationId; maxUses: number | null };
    [ClientSE.CREATE_ROLE]: { orgId: OrganizationId; name: string; color: string };
    [ClientSE.CREATE_FILE_UPLOAD]: { fileName: string; base64: string; mimeType: string };
    [ClientSE.CREATE_MODULE]: {
        name: string;
        parentId: ModuleId;
        type: TrzModuleType;
        data: Partial<ModuleDataMap[TrzModuleType]>;
    };

    [ClientSE.UPDATE_USER_FIELD]: Partial<UserHeader> & { id: UserId };
    [ClientSE.UPDATE_ORG_FIELD]: Partial<OrganizationHeader> & { id: OrganizationId };
    [ClientSE.UPDATE_LIST_FIELD]: Omit<Partial<List> & { id: ListId }, 'order'>;
    [ClientSE.UPDATE_CARD_FIELD]: Omit<Partial<Card> & { id: CardId }, 'listId' | 'order'>;
    [ClientSE.UPDATE_CARD_ASSIGNEE]: { cardId: CardId; userId: UserId; assigned: boolean };
    [ClientSE.UPDATE_BOARD_LABEL]: { boardId: ModuleId; label: Label };
    [ClientSE.UPDATE_CARDS_LABELS]: { cardId: CardId; labelIds: LabelId[] };
    [ClientSE.UPDATE_ROLE]: Role;
    [ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG]: { userId: UserId; orgId: OrganizationId; roleIds: RoleId[] };
    [ClientSE.UPDATE_MODULE_FIELD]: {
        moduleId: ModuleId;
        type: TrzModuleType;
        update: Partial<ModuleDataMap[TrzModuleType]>;
    };

    [ClientSE.DELETE_BOARD_LABEL]: { boardId: ModuleId; labelId: LabelId };
    [ClientSE.DELETE_INVITE]: { inviteId: InviteId };
    [ClientSE.DELETE_MEMBERSHIP]: { userId: UserId; orgId: OrganizationId };
    [ClientSE.DELETE_ROLE]: { roleId: RoleId };
    [ClientSE.DELETE_USER_LINKED_ACCOUNT]: { userId: UserId; provider: LinkedAccountProvider; accountId: string };

    [ClientSE.USE_INVITE]: { inviteId: InviteId };
    [ClientSE.USE_TEXT_BLOCK_HISTORY_SNAPSHOT]: {
        snapshotId: UID;
        resourceId: UID;
        resourceType: TextBlockResourceType;
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

    [ClientSE.GET_USERS_ORGANIZATIONS]: OrganizationHeader[];
    [ClientSE.GET_ORGANIZATION]: OrganizationHeader | undefined;
    [ClientSE.GET_LIST]: ListHeader | undefined;
    [ClientSE.GET_CARD]: Card | undefined;
    [ClientSE.GET_SEARCH_RESULTS]: { results: QueryItem[] } | undefined;
    [ClientSE.GET_SEARCH_TAGS]: { results: QueryItem[] } | undefined;
    [ClientSE.GET_INVITES_FOR_ORG]: Invite[] | undefined;
    [ClientSE.GET_INVITE]: Invite | undefined;
    [ClientSE.GET_USER]: UserHeader | undefined;
    [ClientSE.GET_ORGANIZATION_MEMBERSHIPS]: Member[] | undefined;
    [ClientSE.GET_ROLES_FOR_ORG]: Role[] | undefined;
    [ClientSE.GET_ROLES_FOR_USER_IN_ORG]: RoleId[] | undefined;
    [ClientSE.GET_USERS_LINKED_ACCOUNTS]: LinkedAccount[] | undefined;
    [ClientSE.GET_USERNAME_AVAILABLE]: boolean;
    [ClientSE.GET_TEXT_BLOCK_HISTORY_SNAPSHOTS]: TextBlockSnapshot[] | undefined;
    [ClientSE.GET_MODULE]: ModuleHeader | undefined;
    [ClientSE.GET_MODULE_CHILDREN]: ModuleHeader[] | undefined;

    [ClientSE.CREATE_ORG]: OrganizationId | undefined;
    [ClientSE.CREATE_LIST]: ListId | undefined;
    [ClientSE.CREATE_CARD]: CardId | undefined;
    [ClientSE.CREATE_BOARD_LABEL]: LabelId | undefined;
    [ClientSE.CREATE_DUPLICATE_CARD]: CardId | undefined;
    [ClientSE.CREATE_INVITE]: Invite | undefined;
    [ClientSE.CREATE_ROLE]: Role | undefined;
    [ClientSE.CREATE_FILE_UPLOAD]: UploadedFileId | undefined;
    [ClientSE.CREATE_MODULE]: ModuleId | undefined;

    [ClientSE.UPDATE_USER_FIELD]: undefined;
    [ClientSE.UPDATE_ORG_FIELD]: undefined;
    [ClientSE.UPDATE_LIST_FIELD]: undefined;
    [ClientSE.UPDATE_CARD_FIELD]: undefined;
    [ClientSE.UPDATE_CARD_ASSIGNEE]: undefined;
    [ClientSE.UPDATE_BOARD_LABEL]: undefined;
    [ClientSE.UPDATE_CARDS_LABELS]: undefined;
    [ClientSE.UPDATE_ROLE]: undefined;
    [ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG]: undefined;
    [ClientSE.UPDATE_MODULE_FIELD]: undefined;

    [ClientSE.DELETE_BOARD_LABEL]: undefined;
    [ClientSE.DELETE_INVITE]: undefined;
    [ClientSE.DELETE_MEMBERSHIP]: undefined;
    [ClientSE.DELETE_ROLE]: undefined;
    [ClientSE.DELETE_USER_LINKED_ACCOUNT]: undefined;

    [ClientSE.USE_INVITE]: boolean;
    [ClientSE.USE_TEXT_BLOCK_HISTORY_SNAPSHOT]: boolean;
}
export type ClientSEReply<T extends ClientSE> = (payload: ClientSEReplies[T], error?: string) => void;
