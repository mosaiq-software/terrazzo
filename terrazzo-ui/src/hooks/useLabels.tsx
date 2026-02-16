import { Label, ModuleId, RoomType, ServerSE, updateBaseFromPartial } from '@mosaiq/terrazzo-common';
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
                const boardRes = await getBoardData(sockCtx, boardId);
                setLabels(boardRes?.labels ?? []);
                setBoardData(boardRes);
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
                return;
            }
        };
        fetchLabels();
    }, [boardId, sockCtx.connected]);

    useSocketListener<ServerSE.UPDATE_BOARD_FIELD>(
        ServerSE.UPDATE_BOARD_FIELD,
        (payload) => {
            if (boardId !== payload.id) {
                return;
            }
            setBoardData((prev) => {
                if (!prev) {
                    return prev;
                }
                return updateBaseFromPartial(prev, payload);
            });
        },
        [boardId]
    );

    useSocketListener<ServerSE.UPDATE_BOARD_LABELS>(
        ServerSE.UPDATE_BOARD_LABELS,
        (payload) => {
            if (boardId !== payload.boardId) {
                return;
            }
            setLabels(payload.labels);
        },
        [boardId]
    );

    return { boardData, boardLabels: labels };
};
