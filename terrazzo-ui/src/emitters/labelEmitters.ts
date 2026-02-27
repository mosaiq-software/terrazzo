import { CardId, ClientSE, Label, LabelId, ModuleId } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getLabel = async (sockCtx: SocketContextType, labelId: LabelId): Promise<Label | undefined> => {
    return await sockCtx.emit(ClientSE.GET_LABEL, labelId);
};

export const getModuleLabels = async (
    sockCtx: SocketContextType,
    moduleId: ModuleId
): Promise<LabelId[] | undefined> => {
    return await sockCtx.emit(ClientSE.GET_MODULE_LABELS, moduleId);
};

export const createLabel = async (
    sockCtx: SocketContextType,
    moduleId: ModuleId,
    name: string,
    color: string
): Promise<LabelId | undefined> => {
    return await sockCtx.emit(ClientSE.CREATE_LABEL, { moduleId, name, color });
};

export const updateLabel = async (sockCtx: SocketContextType, label: Label) => {
    await sockCtx.emit(ClientSE.UPDATE_LABEL, { label });
};

export const deleteLabel = async (sockCtx: SocketContextType, labelId: LabelId) => {
    await sockCtx.emit(ClientSE.DELETE_LABEL, { labelId });
};

export const updateCardsLabels = async (sockCtx: SocketContextType, cardId: CardId, labelIds: LabelId[]) => {
    await sockCtx.emit(ClientSE.UPDATE_CARDS_LABELS, { cardId, labelIds });
};
