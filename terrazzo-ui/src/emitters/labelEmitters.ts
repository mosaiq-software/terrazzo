import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { BoardId, LabelId, Label, CardId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';

export const createBoardLabel = async (sockCtx: SocketContextType, boardId: BoardId, name: string, color: string): Promise<LabelId | undefined> => {
    return await sockCtx.emit(ClientSE.CREATE_BOARD_LABEL, { boardId, name, color });
};

export const updateBoardLabel = async (sockCtx: SocketContextType, boardId: BoardId, label: Label) => {
    await sockCtx.emit(ClientSE.UPDATE_BOARD_LABEL, { boardId, label });
};

export const updateCardsLabels = async (sockCtx: SocketContextType, cardId: CardId, labelIds: LabelId[]) => {
    await sockCtx.emit(ClientSE.UPDATE_CARDS_LABELS, { cardId, labelIds });
};

export const deleteBoardLabel = async (sockCtx: SocketContextType, boardId: BoardId, labelId: LabelId) => {
    await sockCtx.emit(ClientSE.DELETE_BOARD_LABEL, { boardId, labelId });
};
