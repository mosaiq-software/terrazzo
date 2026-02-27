import { Label, LabelId, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getLabel } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from '../util/useRoom';
import { useSocketListener } from '../util/useSocketListener';

export const useLabel = (labelId?: LabelId) => {
    const [label, setLabel] = useState<Label | undefined>(undefined);
    const sockCtx = useSocket();
    useRoom(RoomType.DATA, labelId);

    useEffect(() => {
        const fetchLabel = async () => {
            if (!labelId || !sockCtx.connected) {
                return;
            }
            try {
                const label = await getLabel(sockCtx, labelId);
                setLabel(label);
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
                return;
            }
        };
        fetchLabel();
    }, [labelId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_LABEL,
        (payload) => {
            if (labelId !== payload.label.id) {
                return;
            }
            setLabel(payload.label);
        },
        [labelId]
    );

    return label;
};
