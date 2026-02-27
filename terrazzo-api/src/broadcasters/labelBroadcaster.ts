import { CardId, getRoomCode, LabelId, ModuleId, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { getLabelIdsOnModule } from '@trz-api/controllers/labelController';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketActions';

export const syncModuleLabels = async (moduleId: ModuleId) => {
    const labelIds = await getLabelIdsOnModule(moduleId);
    await broadcast({
        event: ServerSE.UPDATE_MODULE_LABELS,
        toRoomIds: [getRoomCode(RoomType.DATA, moduleId, RoomSpecifier.LABELS)],
        buildPayload: async (userId) => {
            if (!(await userCanViewModule(userId, moduleId))) {
                throw new Error('Insufficient permissions to view labels for this board');
            }
            return {
                moduleId,
                labels: labelIds,
            };
        },
    });
};

export const syncCardLabels = async (boardId: ModuleId, cardId: CardId, labelIds: LabelId[]) => {
    await broadcast({
        event: ServerSE.UPDATE_CARDS_LABELS,
        toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
        buildPayload: async (userId) => {
            if (!(await userCanViewModule(userId, boardId))) {
                throw new Error('Insufficient permissions to view labels for this board');
            }
            return { cardId, labelIds };
        },
    });
};
