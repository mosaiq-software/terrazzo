import { BoardId, Card, CardHeader, CardId, ClientSE, ListId, UserId } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getCardData = async (sockCtx: SocketContextType, cardId: BoardId): Promise<Card | undefined> => {
    const card = await sockCtx.emit<ClientSE.GET_CARD>(ClientSE.GET_CARD, cardId);
    return card;
};

export const createCard = async (sockCtx: SocketContextType, listID: ListId, cardName: string): Promise<CardId | undefined> => {
    return await sockCtx.emit(ClientSE.CREATE_CARD, { listID, cardName });
};

export const createDuplicateCard = async (sockCtx: SocketContextType, cardId: CardId): Promise<CardId | undefined> => {
    return await sockCtx.emit(ClientSE.CREATE_DUPLICATE_CARD, { cardId });
};

export const updateCardField = async (sockCtx: SocketContextType, id: CardId, partial: Partial<CardHeader>) => {
    await sockCtx.emit(ClientSE.UPDATE_CARD_FIELD, { ...partial, id });
};

export const updateCardAssignee = async (sockCtx: SocketContextType, cardId: CardId, userId: UserId, assigned: boolean) => {
    await sockCtx.emit(ClientSE.UPDATE_CARD_ASSIGNEE, { cardId, userId, assigned });
};

export const emitMoveCard = async (sockCtx: SocketContextType, cardId: CardId, toList: ListId, position?: number): Promise<void> => {
    await sockCtx.emit(ClientSE.MOVE_CARD, { cardId, toList, position });
};
