import { BoardId, CardId, DirectoryId, DocumentId, InviteId, LabelId, ListId, OrganizationId, RoleId, UID, UserId } from '../../genericTypes';
import { Invite } from '../../inviteTypes';
import { Board, BoardRes, Label } from '../../modules/board/boardTypes';
import { Card } from '../../modules/board/cardTypes';
import { List, ListHeader } from '../../modules/board/listTypes';
import { DirectoryHeader } from '../../modules/directoryTypes';
import { DocumentHeader } from '../../modules/documentTypes';
import { MinimalModuleHeader } from '../../modules/moduleTypes';
import { Member, OrganizationHeader } from '../../organizationTypes';
import { FetchablePermissibleActionType } from '../../permissions/permissibleActions';
import { Role } from '../../permissions/roleTypes';
import { QueryResult } from '../../queryTypes';
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

    GET_USERS_ORGANIZATIONS = 'GET_USERS_ORGANIZATIONS',
    GET_ORGANIZATION = 'GET_ORGANIZATION',
    GET_BOARD = 'GET_BOARD',
    GET_LIST = 'GET_LIST',
    GET_CARD = 'GET_CARD',
    GET_SEARCH_RESULTS = 'GET_SEARCH_RESULTS',
    GET_DOCUMENT = 'GET_DOCUMENT',
    GET_DIRECTORY = 'GET_DIRECTORY',
    GET_DIRECTORY_CONTENTS = 'GET_DIRECTORY_CONTENTS',
    GET_INVITES_FOR_ORG = 'GET_INVITES_FOR_ORG',
    GET_INVITE = 'GET_INVITE',
    GET_USER = 'GET_USER',
    GET_ORGANIZATION_MEMBERSHIPS = 'GET_ORGANIZATION_MEMBERSHIPS',
    GET_ROLES_FOR_ORG = 'GET_ROLES_FOR_ORG',
    GET_ROLES_FOR_USER_IN_ORG = 'GET_ROLES_FOR_USER_IN_ORG',
    GET_CAN_PERFORM_PERMISSIBLE_ACTION = 'GET_CAN_PERFORM_PERMISSIBLE_ACTION',

    CREATE_ORG = 'CREATE_ORG',
    CREATE_BOARD = 'CREATE_BOARD',
    CREATE_LIST = 'CREATE_LIST',
    CREATE_CARD = 'CREATE_CARD',
    CREATE_BOARD_LABEL = 'CREATE_BOARD_LABEL',
    CREATE_DUPLICATE_CARD = 'CREATE_DUPLICATE_CARD',
    CREATE_DOCUMENT = 'CREATE_DOCUMENT',
    CREATE_DIRECTORY = 'CREATE_DIRECTORY',
    CREATE_INVITE = 'CREATE_INVITE',
    CREATE_ROLE = 'CREATE_ROLE',

    UPDATE_ORG_FIELD = 'UPDATE_ORG_FIELD',
    UPDATE_BOARD_FIELD = 'UPDATE_BOARD_FIELD',
    UPDATE_LIST_FIELD = 'UPDATE_LIST_FIELD',
    UPDATE_CARD_FIELD = 'UPDATE_CARD_FIELD',
    UPDATE_CARD_ASSIGNEE = 'UPDATE_CARD_ASSIGNEE',
    UPDATE_BOARD_LABEL = 'UPDATE_BOARD_LABEL',
    UPDATE_CARDS_LABELS = 'UPDATE_CARDS_LABELS',
    UPDATE_DOCUMENT_FIELD = 'UPDATE_DOCUMENT_FIELD',
    UPDATE_DIRECTORY_FIELD = 'UPDATE_DIRECTORY_FIELD',
    UPDATE_DIRECTORY_CONTENTS = 'UPDATE_DIRECTORY_CONTENTS',
    UPDATE_ROLE = 'UPDATE_ROLE',
    UPDATE_ROLES_FOR_USER_IN_ORG = 'UPDATE_ROLES_FOR_USER_IN_ORG',

    DELETE_BOARD_LABEL = 'DELETE_BOARD_LABEL',
    DELETE_INVITE = 'DELETE_INVITE',
    DELETE_MEMBERSHIP = 'DELETE_MEMBERSHIP',
    DELETE_ROLE = 'DELETE_ROLE',

    USE_INVITE = 'USE_INVITE',
}
export interface ClientSEPayload {
    // Client to Server
    [ClientSE.JOIN_ROOM]: RoomId;
    [ClientSE.LEAVE_ROOM]: RoomId;
    [ClientSE.MOUSE_MOVE]: MouseRoomUserData;
    [ClientSE.USER_IDLE]: boolean;
    [ClientSE.MOVE_LIST]: { listId: ListId; position: number };
    [ClientSE.MOVE_CARD]: { cardId: CardId; toList: ListId; position?: number };

    [ClientSE.GET_USERS_ORGANIZATIONS]: UserId;
    [ClientSE.GET_ORGANIZATION]: OrganizationId;
    [ClientSE.GET_BOARD]: BoardId;
    [ClientSE.GET_LIST]: ListId;
    [ClientSE.GET_CARD]: CardId;
    [ClientSE.GET_SEARCH_RESULTS]: { query: string; searchSessionId: string };
    [ClientSE.GET_DOCUMENT]: DocumentId;
    [ClientSE.GET_DIRECTORY]: DirectoryId;
    [ClientSE.GET_DIRECTORY_CONTENTS]: DirectoryId;
    [ClientSE.GET_INVITES_FOR_ORG]: OrganizationId;
    [ClientSE.GET_INVITE]: InviteId;
    [ClientSE.GET_USER]: UserId;
    [ClientSE.GET_ORGANIZATION_MEMBERSHIPS]: OrganizationId;
    [ClientSE.GET_ROLES_FOR_ORG]: OrganizationId;
    [ClientSE.GET_ROLES_FOR_USER_IN_ORG]: { userId: UserId; orgId: OrganizationId };
    [ClientSE.GET_CAN_PERFORM_PERMISSIBLE_ACTION]: FetchablePermissibleActionType;

    [ClientSE.CREATE_ORG]: { name: string };
    [ClientSE.CREATE_BOARD]: { name: string; boardCode: string; parentId: DirectoryId };
    [ClientSE.CREATE_LIST]: { boardID: BoardId; listName: string };
    [ClientSE.CREATE_CARD]: { listID: ListId; cardName: string };
    [ClientSE.CREATE_BOARD_LABEL]: { boardId: BoardId; name: string; color: string };
    [ClientSE.CREATE_DUPLICATE_CARD]: { cardId: CardId };
    [ClientSE.CREATE_DOCUMENT]: { title: string; parentId: UID };
    [ClientSE.CREATE_DIRECTORY]: { name: string; parentId: DirectoryId };
    [ClientSE.CREATE_INVITE]: { orgId: OrganizationId; maxUses: number | null };
    [ClientSE.CREATE_ROLE]: { orgId: OrganizationId; name: string; color: string };

    [ClientSE.UPDATE_ORG_FIELD]: Partial<OrganizationHeader> & { id: OrganizationId };
    [ClientSE.UPDATE_BOARD_FIELD]: Partial<Board> & { id: BoardId };
    [ClientSE.UPDATE_LIST_FIELD]: Partial<List> & { id: ListId };
    [ClientSE.UPDATE_CARD_FIELD]: Partial<Card> & { id: CardId };
    [ClientSE.UPDATE_CARD_ASSIGNEE]: { cardId: CardId; userId: UserId; assigned: boolean };
    [ClientSE.UPDATE_BOARD_LABEL]: { boardId: BoardId; label: Label };
    [ClientSE.UPDATE_CARDS_LABELS]: { cardId: CardId; labelIds: LabelId[] };
    [ClientSE.UPDATE_DOCUMENT_FIELD]: Partial<DocumentHeader> & { id: DocumentId };
    [ClientSE.UPDATE_DIRECTORY_FIELD]: Partial<DirectoryHeader> & { id: DirectoryId };
    [ClientSE.UPDATE_DIRECTORY_CONTENTS]: { directoryId: DirectoryId; contents: UID[] };
    [ClientSE.UPDATE_ROLE]: Role;
    [ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG]: { userId: UserId; orgId: OrganizationId; roleIds: RoleId[] };

    [ClientSE.DELETE_BOARD_LABEL]: { boardId: BoardId; labelId: LabelId };
    [ClientSE.DELETE_INVITE]: { inviteId: InviteId };
    [ClientSE.DELETE_MEMBERSHIP]: { userId: UserId; orgId: OrganizationId };
    [ClientSE.DELETE_ROLE]: { roleId: RoleId };

    [ClientSE.USE_INVITE]: { inviteId: InviteId };
}
export interface ClientSEReplies {
    // Client to Server req - Server to Client callback
    [ClientSE.JOIN_ROOM]: UserData[];
    [ClientSE.LEAVE_ROOM]: undefined;
    [ClientSE.MOUSE_MOVE]: undefined;
    [ClientSE.USER_IDLE]: undefined;
    [ClientSE.MOVE_LIST]: undefined;
    [ClientSE.MOVE_CARD]: undefined;

    [ClientSE.GET_USERS_ORGANIZATIONS]: OrganizationHeader[];
    [ClientSE.GET_ORGANIZATION]: OrganizationHeader | undefined;
    [ClientSE.GET_BOARD]: BoardRes | undefined;
    [ClientSE.GET_LIST]: ListHeader | undefined;
    [ClientSE.GET_CARD]: Card | undefined;
    [ClientSE.GET_SEARCH_RESULTS]: { results: QueryResult[] } | undefined;
    [ClientSE.GET_DOCUMENT]: DocumentHeader | undefined;
    [ClientSE.GET_DIRECTORY]: DirectoryHeader | undefined;
    [ClientSE.GET_DIRECTORY_CONTENTS]: (MinimalModuleHeader & { canAccess: boolean })[] | undefined;
    [ClientSE.GET_INVITES_FOR_ORG]: Invite[] | undefined;
    [ClientSE.GET_INVITE]: Invite | undefined;
    [ClientSE.GET_USER]: UserHeader | undefined;
    [ClientSE.GET_ORGANIZATION_MEMBERSHIPS]: Member[] | undefined;
    [ClientSE.GET_ROLES_FOR_ORG]: Role[] | undefined;
    [ClientSE.GET_ROLES_FOR_USER_IN_ORG]: RoleId[] | undefined;
    [ClientSE.GET_CAN_PERFORM_PERMISSIBLE_ACTION]: boolean;

    [ClientSE.CREATE_ORG]: OrganizationId | undefined;
    [ClientSE.CREATE_BOARD]: BoardId | undefined;
    [ClientSE.CREATE_LIST]: ListId | undefined;
    [ClientSE.CREATE_CARD]: CardId | undefined;
    [ClientSE.CREATE_BOARD_LABEL]: LabelId | undefined;
    [ClientSE.CREATE_DUPLICATE_CARD]: CardId | undefined;
    [ClientSE.CREATE_DOCUMENT]: DocumentHeader | undefined;
    [ClientSE.CREATE_DIRECTORY]: DirectoryHeader | undefined;
    [ClientSE.CREATE_INVITE]: Invite | undefined;
    [ClientSE.CREATE_ROLE]: Role | undefined;

    [ClientSE.UPDATE_ORG_FIELD]: undefined;
    [ClientSE.UPDATE_BOARD_FIELD]: undefined;
    [ClientSE.UPDATE_LIST_FIELD]: undefined;
    [ClientSE.UPDATE_CARD_FIELD]: undefined;
    [ClientSE.UPDATE_CARD_ASSIGNEE]: undefined;
    [ClientSE.UPDATE_BOARD_LABEL]: undefined;
    [ClientSE.UPDATE_CARDS_LABELS]: undefined;
    [ClientSE.UPDATE_DOCUMENT_FIELD]: undefined;
    [ClientSE.UPDATE_DIRECTORY_FIELD]: undefined;
    [ClientSE.UPDATE_DIRECTORY_CONTENTS]: undefined;
    [ClientSE.UPDATE_ROLE]: undefined;
    [ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG]: undefined;

    [ClientSE.DELETE_BOARD_LABEL]: undefined;
    [ClientSE.DELETE_INVITE]: undefined;
    [ClientSE.DELETE_MEMBERSHIP]: undefined;
    [ClientSE.DELETE_ROLE]: undefined;

    [ClientSE.USE_INVITE]: boolean;
}
export type ClientSEReply<T extends ClientSE> = (payload: ClientSEReplies[T], error?: string) => void;
