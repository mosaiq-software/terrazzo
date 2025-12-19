import { BoardId, ClientSE, ListHeader, ListId } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getListData = async (sockCtx: SocketContextType, listId: BoardId): Promise<ListHeader | undefined> => {
    const list = await sockCtx.emit(ClientSE.GET_LIST, listId);
    return list;
};

export const createList = async (sockCtx: SocketContextType, boardID: BoardId, listName: string): Promise<ListId | undefined> => {
    return await sockCtx.emit(ClientSE.CREATE_LIST, { boardID, listName });
};

export const updateListField = async (sockCtx: SocketContextType, id: ListId, partial: Partial<ListHeader>) => {
    await sockCtx.emit(ClientSE.UPDATE_LIST_FIELD, { ...partial, id });
};

export const emitMoveList = async (sockCtx: SocketContextType, listId: ListId, position: number): Promise<void> => {
    await sockCtx.emit(ClientSE.MOVE_LIST, { listId, position });
};
