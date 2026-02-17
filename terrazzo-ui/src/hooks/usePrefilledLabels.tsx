import { Label, LabelId, ModuleId, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getLabel, getModuleLabels } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect } from 'react';
import { useMap } from './useMap';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useLabels = (moduleId?: ModuleId) => {
    const [labels] = useMap<LabelId, Label | undefined>();
    const sockCtx = useSocket();
    useRoom(RoomType.DATA, moduleId, RoomSpecifier.LABELS);

    // Fetch initial label IDs for the module when moduleId or socket connection changes
    useEffect(() => {
        const fetchLabels = async () => {
            if (!moduleId || !sockCtx.connected) {
                return;
            }
            try {
                const labelIds = (await getModuleLabels(sockCtx, moduleId)) || [];
                for (const labelId of labelIds) {
                    labels.set(labelId, undefined);
                }
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
                return;
            }
        };
        fetchLabels();
    }, [moduleId, sockCtx.connected]);

    // Fetch label data for any labels that are currently undefined
    useEffect(() => {
        const fetchLabelData = async (labelId: LabelId) => {
            try {
                const labelData = await getLabel(sockCtx, labelId);
                if (labelData) {
                    labels.set(labelId, labelData);
                } else {
                    labels.delete(labelId);
                }
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
            }
        };
        for (const [labelId, labelData] of labels) {
            if (!labelData) {
                fetchLabelData(labelId);
            }
        }
    }, [labels, sockCtx]);

    useSocketListener(
        ServerSE.UPDATE_MODULE_LABELS,
        (payload) => {
            if (moduleId !== payload.moduleId) {
                return;
            }
            const newLabelIds = payload.labels;
            const currentLabelIds = labels.keys();
            // Remove labels that are no longer present
            for (const labelId of currentLabelIds) {
                if (!newLabelIds.includes(labelId)) {
                    labels.delete(labelId);
                }
            }
            // Add new labels
            for (const labelId of newLabelIds) {
                if (!labels.has(labelId)) {
                    labels.set(labelId, undefined);
                }
            }
        },
        [moduleId, labels]
    );

    useSocketListener(
        ServerSE.UPDATE_LABEL,
        (payload) => {
            if (labels.has(payload.label.id)) {
                labels.set(payload.label.id, payload.label);
            }
        },
        [labels]
    );

    return {
        labels: Array.from(labels.values()).filter((label) => !!label),
        getLabelById: (id: LabelId) => labels.get(id),
    };
};
