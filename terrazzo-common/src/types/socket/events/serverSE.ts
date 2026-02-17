import { CardId, LabelId, ListId, ModuleId, OrganizationId, RoleId, TextBlockId, UserId } from '../../genericTypes';
import { Invite } from '../../inviteTypes';
import { LinkedAccount } from '../../linkedAccountTypes';
import { CardHeader } from '../../modules/board/cardTypes';
import { Label } from '../../modules/board/labelTypes';
import { ListHeader } from '../../modules/board/listTypes';
import { ModuleHeader } from '../../modules/moduleTypes';
import { OrganizationHeader } from '../../organizationTypes';
import { Role } from '../../permissions/roleTypes';
import { TextBlockSnapshot } from '../../textTypes';
import { UserHeader } from '../../userTypes';
import { MouseRoomUserData } from '../roomTypes';
import { SocketId, UserData } from '../socketTypes';

// SERVER SOCKET EVENTS
export enum ServerSE {
    // Server to Client
    READY = 'READY',
    CLIENT_JOINED_ROOM = 'CLIENT_JOINED_ROOM',
    CLIENT_LEFT_ROOM = 'CLIENT_LEFT_ROOM',

    MOUSE_MOVE = 'MOUSE_MOVE',
    USER_IDLE = 'USER_IDLE',
    MOVE_LIST = 'MOVE_LIST',
    MOVE_CARD = 'MOVE_CARD',

    ADD_LIST = 'ADD_LIST',
    ADD_CARD = 'ADD_CARD',

    UPDATE_USER_FIELD = 'UPDATE_USER_FIELD',
    UPDATE_ORG_FIELD = 'UPDATE_ORG_FIELD',
    UPDATE_LIST_FIELD = 'UPDATE_LIST_FIELD',
    UPDATE_CARD_FIELD = 'UPDATE_CARD_FIELD',
    UPDATE_CARD_ASSIGNEE = 'UPDATE_CARD_ASSIGNEE',
    UPDATE_MODULE_LABELS = 'UPDATE_MODULE_LABELS',
    UPDATE_LABEL = 'UPDATE_LABEL',
    UPDATE_CARDS_LABELS = 'UPDATE_CARDS_LABELS',
    UPDATE_USERS_ORGANIZATIONS = 'UPDATE_USERS_ORGANIZATIONS',
    UPDATE_ORGANIZATION_MEMBERSHIPS = 'UPDATE_ORGANIZATION_MEMBERSHIPS',
    UPDATE_ORGANIZATION_INVITES = 'UPDATE_ORGANIZATION_INVITES',
    UPDATE_ORGANIZATION_ROLES = 'UPDATE_ORGANIZATION_ROLES',
    UPDATE_ROLES_FOR_USER_IN_ORG = 'UPDATE_ROLES_FOR_USER_IN_ORG',
    UPDATE_USERS_LINKED_ACCOUNTS = 'UPDATE_USERS_LINKED_ACCOUNTS',
    UPDATE_TEXT_BLOCK_HISTORY_SNAPSHOTS = 'UPDATE_TEXT_BLOCK_HISTORY_SNAPSHOTS',
    UPDATE_MODULE_FIELD = 'UPDATE_MODULE_FIELD',
    UPDATE_MODULE_CHILDREN = 'UPDATE_MODULE_CHILDREN',
}
export interface ServerSEPayload {
    // Server to Client
    [ServerSE.READY]: void;
    [ServerSE.CLIENT_JOINED_ROOM]: UserData;
    [ServerSE.CLIENT_LEFT_ROOM]: SocketId;

    [ServerSE.MOUSE_MOVE]: { sid: SocketId; data: MouseRoomUserData };
    [ServerSE.USER_IDLE]: { sid: SocketId; idle: boolean };
    [ServerSE.MOVE_LIST]: { listId: ListId; position: number | null };
    [ServerSE.MOVE_CARD]: { cardId: CardId; toList: ListId; position?: number | null };

    [ServerSE.ADD_LIST]: { boardId: ModuleId; listId: ListId };
    [ServerSE.ADD_CARD]: { listId: ListId; cardId: CardId };

    [ServerSE.UPDATE_USER_FIELD]: Partial<UserHeader> & { id: UserId };
    [ServerSE.UPDATE_ORG_FIELD]: Partial<OrganizationHeader> & { id: OrganizationId };
    [ServerSE.UPDATE_LIST_FIELD]: Partial<ListHeader> & { id: ListId };
    [ServerSE.UPDATE_CARD_FIELD]: Partial<CardHeader> & { id: CardId };
    [ServerSE.UPDATE_CARD_ASSIGNEE]: { cardId: CardId; userId: UserId; assigned: boolean };
    [ServerSE.UPDATE_MODULE_LABELS]: { moduleId: ModuleId; labels: LabelId[] };
    [ServerSE.UPDATE_LABEL]: { label: Label };
    [ServerSE.UPDATE_CARDS_LABELS]: { cardId: CardId; labelIds: LabelId[] };
    [ServerSE.UPDATE_USERS_ORGANIZATIONS]: { userId: UserId; organizations: OrganizationHeader[] };
    [ServerSE.UPDATE_ORGANIZATION_MEMBERSHIPS]: { orgId: OrganizationId; members: UserId[] };
    [ServerSE.UPDATE_ORGANIZATION_INVITES]: { orgId: OrganizationId; invites: Invite[] };
    [ServerSE.UPDATE_ORGANIZATION_ROLES]: { orgId: OrganizationId; roles: Role[] };
    [ServerSE.UPDATE_ROLES_FOR_USER_IN_ORG]: { userId: UserId; orgId: OrganizationId; roleIds: RoleId[] };
    [ServerSE.UPDATE_USERS_LINKED_ACCOUNTS]: { userId: UserId; linkedAccounts: LinkedAccount[] };
    [ServerSE.UPDATE_TEXT_BLOCK_HISTORY_SNAPSHOTS]: { textBlockId: TextBlockId; snapshots: TextBlockSnapshot[] };
    [ServerSE.UPDATE_MODULE_FIELD]: Partial<ModuleHeader> & { id: ModuleId };
    [ServerSE.UPDATE_MODULE_CHILDREN]: {
        moduleId: ModuleId;
        children: ModuleId[];
    };
}

export type ServerSEReply = (payload: void, error?: string) => void;
