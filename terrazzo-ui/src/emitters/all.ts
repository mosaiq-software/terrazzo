import { EntityType, Role } from '@mosaiq/terrazzo-common/constants';
import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { Board, BoardHeader, BoardId, BoardRes, Card, CardHeader, CardId, DocumentHeader, DocumentId, EntityId, Invite, InviteId, Label, LabelId, List, ListHeader, ListId, MembershipRecord, MembershipRecordId, Organization, OrganizationHeader, OrganizationId, Project, ProjectHeader, ProjectId, UID, UserDash, UserId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';
import { NoteType, notify } from '@trz/util/notifications';

export const getUsersDash = async (sockCtx: SocketContextType, userId: UserId): Promise<UserDash | undefined> => {
    try {
        const response = await sockCtx.emit<ClientSE.GET_USER_DASH>(ClientSE.GET_USER_DASH, userId);
        if (!response) throw new Error('No data found for user ' + userId);
        return response;
    } catch (e: any) {
        notify(NoteType.DASH_ERROR, e);
        return undefined;
    }
};

export const getOrganizationData = async (sockCtx: SocketContextType, orgId: OrganizationId): Promise<Organization | undefined> => {
    try {
        const org = await sockCtx.emit<ClientSE.GET_ORGANIZATION>(ClientSE.GET_ORGANIZATION, orgId);
        return org;
    } catch (e: any) {
        notify(NoteType.ORG_DATA_ERROR, e);
        return undefined;
    }
};

export const getProjectData = async (sockCtx: SocketContextType, projectId: ProjectId): Promise<Project | undefined> => {
    try {
        const project = await sockCtx.emit<ClientSE.GET_PROJECT>(ClientSE.GET_PROJECT, projectId);
        return project;
    } catch (e: any) {
        notify(NoteType.PROJECT_DATA_ERROR, e);
        return undefined;
    }
};

export const getBoardData = async (sockCtx: SocketContextType, boardId: BoardId): Promise<BoardRes | undefined> => {
    try {
        const board = await sockCtx.emit<ClientSE.GET_BOARD>(ClientSE.GET_BOARD, boardId);
        return board;
    } catch (e: any) {
        notify(NoteType.BOARD_DATA_ERROR, e);
    }
};

export const getListData = async (sockCtx: SocketContextType, listId: BoardId): Promise<ListHeader | undefined> => {
    try {
        const list = await sockCtx.emit<ClientSE.GET_LIST>(ClientSE.GET_LIST, listId);
        return list;
    } catch (e: any) {
        notify(NoteType.LIST_DATA_ERROR, e);
    }
};

export const getCardData = async (sockCtx: SocketContextType, cardId: BoardId): Promise<Card | undefined> => {
    try {
        const card = await sockCtx.emit<ClientSE.GET_CARD>(ClientSE.GET_CARD, cardId);
        return card;
    } catch (e: any) {
        notify(NoteType.CARD_DATA_ERROR, e);
    }
};

export const createOrganization = async (sockCtx: SocketContextType, name: string, creator: UserId): Promise<OrganizationId | undefined> => {
    return await sockCtx.emit<ClientSE.CREATE_ORG>(ClientSE.CREATE_ORG, { name, creator });
};

export const createProject = async (sockCtx: SocketContextType, name: string, orgId: OrganizationId): Promise<ProjectId | undefined> => {
    return await sockCtx.emit<ClientSE.CREATE_PROJECT>(ClientSE.CREATE_PROJECT, { name, orgId });
};

export const createBoard = async (sockCtx: SocketContextType, name: string, boardCode: string, projectId: ProjectId): Promise<BoardId | undefined> => {
    return await sockCtx.emit<ClientSE.CREATE_BOARD>(ClientSE.CREATE_BOARD, { name, boardCode, projectId });
};

export const createList = async (sockCtx: SocketContextType, boardID: BoardId, listName: string): Promise<ListId | undefined> => {
    return await sockCtx.emit<ClientSE.CREATE_LIST>(ClientSE.CREATE_LIST, { boardID, listName });
};

export const createCard = async (sockCtx: SocketContextType, listID: ListId, cardName: string): Promise<CardId | undefined> => {
    return await sockCtx.emit<ClientSE.CREATE_CARD>(ClientSE.CREATE_CARD, { listID, cardName });
};

export const createBoardLabel = async (sockCtx: SocketContextType, boardId: BoardId, name: string, color: string): Promise<LabelId | undefined> => {
    return await sockCtx.emit<ClientSE.CREATE_BOARD_LABEL>(ClientSE.CREATE_BOARD_LABEL, { boardId, name, color });
};

export const createDuplicateCard = async (sockCtx: SocketContextType, cardId: CardId): Promise<CardId | undefined> => {
    return await sockCtx.emit<ClientSE.CREATE_DUPLICATE_CARD>(ClientSE.CREATE_DUPLICATE_CARD, { cardId });
};

export async function updateField<T extends CardHeader | ListHeader | BoardHeader | ProjectHeader | OrganizationHeader | MembershipRecord>(sockCtx: SocketContextType, event: ClientSE.UPDATE_ORG_FIELD | ClientSE.UPDATE_PROJECT_FIELD | ClientSE.UPDATE_BOARD_FIELD | ClientSE.UPDATE_LIST_FIELD | ClientSE.UPDATE_CARD_FIELD | ClientSE.UPDATE_MEMBERSHIP_RECORD_FIELD, id: UID, partial: Partial<T>): Promise<void> {
    try {
        await sockCtx.emit<typeof event>(event, { ...partial, id });
    } catch (e: any) {
        notify(
            {
                [ClientSE.UPDATE_ORG_FIELD]: NoteType.ORG_DATA_ERROR,
                [ClientSE.UPDATE_PROJECT_FIELD]: NoteType.PROJECT_DATA_ERROR,
                [ClientSE.UPDATE_BOARD_FIELD]: NoteType.BOARD_DATA_ERROR,
                [ClientSE.UPDATE_LIST_FIELD]: NoteType.LIST_UPDATE_ERROR,
                [ClientSE.UPDATE_CARD_FIELD]: NoteType.CARD_UPDATE_ERROR,
                [ClientSE.UPDATE_MEMBERSHIP_RECORD_FIELD]: NoteType.MEMBERSHIP_UPDATE_ERROR,
            }[event],
            e
        );
    }
}

export const updateOrgField = async (sockCtx: SocketContextType, id: OrganizationId, partial: Partial<OrganizationHeader>) => updateField<OrganizationHeader>(sockCtx, ClientSE.UPDATE_ORG_FIELD, id, partial);
export const updateProjectField = async (sockCtx: SocketContextType, id: ProjectId, partial: Partial<ProjectHeader>) => updateField<ProjectHeader>(sockCtx, ClientSE.UPDATE_PROJECT_FIELD, id, partial);
export const updateBoardField = async (sockCtx: SocketContextType, id: BoardId, partial: Partial<BoardHeader>) => updateField<BoardHeader>(sockCtx, ClientSE.UPDATE_BOARD_FIELD, id, partial);
export const updateListField = async (sockCtx: SocketContextType, id: ListId, partial: Partial<ListHeader>) => updateField<ListHeader>(sockCtx, ClientSE.UPDATE_LIST_FIELD, id, partial);
export const updateCardField = async (sockCtx: SocketContextType, id: CardId, partial: Partial<CardHeader>) => updateField<CardHeader>(sockCtx, ClientSE.UPDATE_CARD_FIELD, id, partial);
export const updateMembershipRecordField = async (sockCtx: SocketContextType, id: MembershipRecordId, partial: Partial<MembershipRecord>) => updateField<MembershipRecord>(sockCtx, ClientSE.UPDATE_MEMBERSHIP_RECORD_FIELD, id, partial);

export const updateCardAssignee = async (sockCtx: SocketContextType, cardId: CardId, userId: UserId, assigned: boolean) => {
    await sockCtx.emit<ClientSE.UPDATE_CARD_ASSIGNEE>(ClientSE.UPDATE_CARD_ASSIGNEE, { cardId, userId, assigned });
};

export const updateBoardLabel = async (sockCtx: SocketContextType, boardId: BoardId, label: Label) => {
    await sockCtx.emit<ClientSE.UPDATE_BOARD_LABEL>(ClientSE.UPDATE_BOARD_LABEL, { boardId, label });
};

export const updateCardsLabels = async (sockCtx: SocketContextType, cardId: CardId, labelIds: LabelId[]) => {
    await sockCtx.emit<ClientSE.UPDATE_CARDS_LABELS>(ClientSE.UPDATE_CARDS_LABELS, { cardId, labelIds });
};

export const deleteBoardLabel = async (sockCtx: SocketContextType, boardId: BoardId, labelId: LabelId) => {
    await sockCtx.emit<ClientSE.DELETE_BOARD_LABEL>(ClientSE.DELETE_BOARD_LABEL, { boardId, labelId });
};

export const sendInvite = async (sockCtx: SocketContextType, toUsername: string, entityId: EntityId, entityType: EntityType, role: Role) => {
    try {
        const invite = await sockCtx.emit<ClientSE.SEND_INVITE>(ClientSE.SEND_INVITE, { toUsername, entityId, entityType, role });
        return invite;
    } catch (e) {
        return undefined;
    }
};

export const replyInvite = async (sockCtx: SocketContextType, inviteId: InviteId, accept: boolean) => {
    await sockCtx.emit<ClientSE.RESPOND_INVITE>(ClientSE.RESPOND_INVITE, { inviteId, response: accept });
};

export const revokeMembershipRecord = async (sockCtx: SocketContextType, membershipRecordId: MembershipRecordId) => {
    await sockCtx.emit<ClientSE.KICK_MEMBER>(ClientSE.KICK_MEMBER, membershipRecordId);
};

export const getUserHeader = async (sockCtx: SocketContextType, userId: UserId) => {
    return await sockCtx.emit<ClientSE.PREVIEW_USER>(ClientSE.PREVIEW_USER, userId);
};

export const emitMoveList = async (sockCtx: SocketContextType, listId: ListId, position: number): Promise<void> => {
    await sockCtx.emit<ClientSE.MOVE_LIST>(ClientSE.MOVE_LIST, { listId, position });
};

export const emitMoveCard = async (sockCtx: SocketContextType, cardId: CardId, toList: ListId, position?: number): Promise<void> => {
    await sockCtx.emit<ClientSE.MOVE_CARD>(ClientSE.MOVE_CARD, { cardId, toList, position });
};

export const getSearchResults = async (sockCtx: SocketContextType, query: string, searchSessionId: string) => {
    return await sockCtx.emit<ClientSE.GET_SEARCH_RESULTS>(ClientSE.GET_SEARCH_RESULTS, { query, searchSessionId });
};

export const getDocument = async (sockCtx: SocketContextType, documentId: DocumentId) => {
    return await sockCtx.emit<ClientSE.GET_DOCUMENT>(ClientSE.GET_DOCUMENT, documentId);
};

export const createDocument = async (sockCtx: SocketContextType, title: string, parentId: UID) => {
    return await sockCtx.emit<ClientSE.CREATE_DOCUMENT>(ClientSE.CREATE_DOCUMENT, { parentId, title });
};

export const updateDocumentMetadata = async (sockCtx: SocketContextType, documentId: DocumentId, partial: Partial<DocumentHeader>) => {
    await sockCtx.emit<ClientSE.UPDATE_DOCUMENT_FIELD>(ClientSE.UPDATE_DOCUMENT_FIELD, { ...partial, id: documentId });
};
