import { Label, ModuleId, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getBoardData } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useLabels = (moduleId?: ModuleId) => {
    const [labels, setLabels] = useState<Label[]>([]);
    const sockCtx = useSocket();
    useRoom(RoomType.DATA, moduleId);

    useEffect(() => {
        const fetchLabels = async () => {
            if (!moduleId || !sockCtx.connected) {
                return;
            }
            try {
                const boardRes = await getBoardData(sockCtx, moduleId);
                setLabels(boardRes?.labels ?? []);
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
                return;
            }
        };
        fetchLabels();
    }, [moduleId, sockCtx.connected]);

    useSocketListener<ServerSE.UPDATE_BOARD_LABELS>(
        ServerSE.UPDATE_BOARD_LABELS,
        (payload) => {
            if (moduleId !== payload.boardId) {
                return;
            }
            setLabels(payload.labels);
        },
        [moduleId]
    );

    return labels;
};
