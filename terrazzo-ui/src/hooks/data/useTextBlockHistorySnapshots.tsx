import {
    RoomType,
    ServerSE,
    TextBlockId,
    TextBlockResourceType,
    TextBlockSnapshot,
    UID,
} from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getTextBlockHistorySnapshots } from '@trz/emitters/textEmitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from '../util/useRoom';
import { useSocketListener } from '../util/useSocketListener';

export const useTextBlockHistorySnapshots = (
    textBlockId?: TextBlockId,
    resourceId?: UID,
    resourceType?: TextBlockResourceType
) => {
    useRoom(RoomType.DATA, textBlockId);
    const sockCtx = useSocket();
    const [snapshots, setSnapshots] = useState<TextBlockSnapshot[]>([]);

    useEffect(() => {
        const fetchTextBlockHistoryData = async () => {
            if (!textBlockId || !resourceId || !resourceType || !sockCtx.connected) {
                return;
            }
            try {
                const res = await getTextBlockHistorySnapshots(sockCtx, resourceId, resourceType);
                setSnapshots(res || []);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
                return;
            }
        };
        fetchTextBlockHistoryData();
    }, [textBlockId, resourceId, resourceType, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_TEXT_BLOCK_HISTORY_SNAPSHOTS,
        (payload) => {
            if (payload.textBlockId !== textBlockId) {
                return;
            }
            setSnapshots(payload.snapshots);
        },
        [textBlockId]
    );

    return snapshots;
};
