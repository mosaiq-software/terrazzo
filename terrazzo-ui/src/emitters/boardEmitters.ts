import { BoardHeader, BoardId, BoardRes, ClientSE, UID } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getBoardData = async (sockCtx: SocketContextType, boardId: BoardId): Promise<BoardRes | undefined> => {
    const board = await sockCtx.emit(ClientSE.GET_BOARD, boardId);
    return board;
};

export const createBoard = async (
    sockCtx: SocketContextType,
    name: string,
    boardCode: string,
    parentId: UID
): Promise<BoardId | undefined> => {
    return await sockCtx.emit(ClientSE.CREATE_BOARD, { name, boardCode, parentId });
};

export const updateBoardField = async (sockCtx: SocketContextType, id: BoardId, partial: Partial<BoardHeader>) => {
    await sockCtx.emit(ClientSE.UPDATE_BOARD_FIELD, { ...partial, id });
};
