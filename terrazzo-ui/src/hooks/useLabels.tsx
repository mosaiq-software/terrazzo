import { LabelId, ModuleId, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getModuleLabels } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useLabels = (moduleId?: ModuleId) => {
    const [labelIds, setLabelIds] = useState<LabelId[]>([]);
    const sockCtx = useSocket();
    useRoom(RoomType.DATA, moduleId, RoomSpecifier.LABELS);

    useEffect(() => {
        const fetchLabels = async () => {
            if (!moduleId || !sockCtx.connected) {
                return;
            }
            try {
                const labelIds = await getModuleLabels(sockCtx, moduleId);
                setLabelIds(labelIds ?? []);
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
                return;
            }
        };
        fetchLabels();
    }, [moduleId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_MODULE_LABELS,
        (payload) => {
            if (moduleId !== payload.moduleId) {
                return;
            }
            setLabelIds(payload.labels);
        },
        [moduleId]
    );

    return labelIds;
};
