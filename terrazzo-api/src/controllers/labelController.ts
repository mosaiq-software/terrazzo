import { Label, LabelId, ModuleId } from '@mosaiq/terrazzo-common';
import { syncLabel, syncModuleLabels } from '@trz-api/broadcasters/labelBroadcaster';
import { deleteLabelingOnCardsByLabelIdDb } from '@trz-api/persistence/labelAssignmentPersistence';
import {
    createLabelOnBoardDb,
    deleteLabelDb,
    getLabelByIdDb,
    getLabelIdsByBoardIdDb,
    updateLabelDb,
} from '@trz-api/persistence/labelPersistence';

export const getLabelIdsOnModule = async (moduleId: ModuleId): Promise<LabelId[]> => {
    const labels = await getLabelIdsByBoardIdDb(moduleId);
    return labels;
};

export async function createBoardLabel(moduleId: ModuleId, name: string, color: string): Promise<LabelId> {
    const label: Label = {
        name,
        color,
        boardId: moduleId,
        id: crypto.randomUUID(),
    };
    await createLabelOnBoardDb(label, moduleId);

    // Sync updated labels to clients
    await syncModuleLabels(moduleId);

    return label.id;
}

export async function removeBoardLabel(moduleId: ModuleId, labelId: LabelId) {
    await deleteLabelDb(labelId);
    await deleteLabelingOnCardsByLabelIdDb(labelId);

    // Sync updated labels to clients
    await syncModuleLabels(moduleId);
}

export async function updateBoardLabels(updatedLabel: Label) {
    const label = await getLabelByIdDb(updatedLabel.id);
    if (!label) {
        throw new Error('Label does not exist');
    }
    await updateLabelDb(updatedLabel);
    // Sync updated labels to clients
    await syncLabel(updatedLabel.id);
}

export const getLabelsModule = async (labelId: LabelId): Promise<ModuleId> => {
    const label = await getLabelByIdDb(labelId);
    if (!label) {
        throw new Error('Label not found');
    }
    return label.boardId;
};
