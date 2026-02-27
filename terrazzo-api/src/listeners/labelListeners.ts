import { ClientSE } from '@mosaiq/terrazzo-common';
import { setCardsLabels } from '@trz-api/controllers/cardController';
import { getBoardIDFromCardID } from '@trz-api/controllers/cardQueries';
import { getLabelIdsOnModule } from '@trz-api/controllers/labelController';
import { userCanManageCards, userCanViewModule } from '@trz-api/utils/permissions';
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

    subscribe(socket, ClientSE.UPDATE_CARDS_LABELS, async (data) => {
        const moduleId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanManageCards(socket, moduleId))) {
            throw new Error('Insufficient permissions to update labels for cards on this board');
        }
        await setCardsLabels(data.cardId, data.labelIds);
        return undefined;
    });
};
