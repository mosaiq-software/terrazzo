import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { BoardHeader, BoardId, Label } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { getBoardData } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useBoard = (boardId?: BoardId) => {
    const [boardData, setBoardData] = useState<BoardHeader | undefined>(undefined);
    const [boardLabels, setBoardLabels] = useState<Label[]>([]);
    const sockCtx = useSocket();
    const trz = useTRZ();
    useRoom(RoomType.DATA, boardId, false);

    useEffect(() => {
        const fetchBoardData = async () => {
            if (!boardId || !sockCtx.connected) {
                return;
            }
            try {
                const boardRes = await getBoardData(sockCtx, boardId);
                setBoardLabels(boardRes?.labels ?? []);
                setBoardData(boardRes);
                trz.setBoardData(boardRes);
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
                return;
            }
        };
        fetchBoardData();
        return () => {
            trz.setBoardData(undefined);
        };
    }, [boardId, sockCtx.connected]);

    useSocketListener<ServerSE.UPDATE_BOARD_FIELD>(ServerSE.UPDATE_BOARD_FIELD, (payload) => {
        if (boardId !== payload.id) {
            return;
        }
        setBoardData((prev) => {
            if (!prev) {
                return prev;
            }
            return updateBaseFromPartial(prev, payload);
        });
    });

    useSocketListener<ServerSE.UPDATE_BOARD_LABELS>(ServerSE.UPDATE_BOARD_LABELS, (payload) => {
        if (boardId !== payload.boardId) {
            return;
        }
        setBoardLabels(payload.labels);
    });

    return { boardData, boardLabels };
};
