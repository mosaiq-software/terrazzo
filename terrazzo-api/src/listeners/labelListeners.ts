import { ClientSE } from '@mosaiq/terrazzo-common';
import { getBoardIDFromCardID, setCardsLabels } from '@trz-api/controllers/cardController';
import {
    createBoardLabel,
    getLabelIdsOnModule,
    getLabelsModule,
    removeBoardLabel,
    updateBoardLabels,
} from '@trz-api/controllers/labelController';
import { getLabelByIdDb } from '@trz-api/persistence/labelPersistence';
import { userCanManageCards, userCanManageModule, userCanViewModule } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { Socket } from 'socket.io';

export const registerLabelListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_MODULE_LABELS, async (data) => {
        if (!(await userCanViewModule(socket, data))) {
            throw new Error('Insufficient permissions to view labels for this board');
        }
        const labels = await getLabelIdsOnModule(data);
        return labels;
    });

    subscribe(socket, ClientSE.GET_LABEL, async (data) => {
        const label = await getLabelByIdDb(data);
        if (!label) {
            throw new Error('Label not found');
        }
        if (!(await userCanViewModule(socket, label.boardId))) {
            throw new Error('Insufficient permissions to view this label');
        }
        return label;
    });

    subscribe(socket, ClientSE.CREATE_LABEL, async (data) => {
        if (!(await userCanManageModule(socket, data.moduleId))) {
            throw new Error('Insufficient permissions to create labels for this board');
        }
        const newLabelId = await createBoardLabel(data.moduleId, data.name, data.color);
        return newLabelId;
    });

    subscribe(socket, ClientSE.UPDATE_LABEL, async (data) => {
        const moduleId = await getLabelsModule(data.label.id);
        if (!(await userCanManageModule(socket, moduleId))) {
            throw new Error('Insufficient permissions to update labels for this board');
        }
        await updateBoardLabels(data.label);
        return undefined;
    });

    subscribe(socket, ClientSE.DELETE_LABEL, async (data) => {
        const moduleId = await getLabelsModule(data.labelId);
        if (!(await userCanManageModule(socket, moduleId))) {
            throw new Error('Insufficient permissions to delete labels for this board');
        }
        await removeBoardLabel(moduleId, data.labelId);
        return undefined;
    });

    subscribe(socket, ClientSE.UPDATE_CARDS_LABELS, async (data) => {
        const moduleId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanManageCards(socket, moduleId))) {
            throw new Error('Insufficient permissions to update labels for cards on this board');
        }
        await setCardsLabels(data.cardId, data.labelIds);
        return undefined;
    });
};
