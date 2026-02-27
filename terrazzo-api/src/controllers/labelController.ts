import { Label, LabelId, ModuleId } from '@mosaiq/terrazzo-common';
import { syncLabel, syncModuleLabels } from '@trz-api/broadcasters/labelBroadcaster';
import { deleteLabelingOnCardsByLabelIdDb } from '@trz-api/persistence/labelAssignmentPersistence';
import { deleteLabelDb, getLabelIdsByBoardIdDb } from '@trz-api/persistence/labelPersistence';
import { labelHandler } from './dataSources/objectHandlers/label';

export const getLabelIdsOnModule = async (moduleId: ModuleId): Promise<LabelId[]> => {
    const labels = await getLabelIdsByBoardIdDb(moduleId);
    return labels;
};

export async function createBoardLabel(moduleId: ModuleId, name: string, color: string): Promise<LabelId> {
    const labelId = await labelHandler.create(
        {
            boardId: moduleId,
            name,
            color,
        },
        { preventSync: true }
    );

    // Sync updated labels to clients
    await syncModuleLabels(moduleId);

    return labelId;
}

export async function removeBoardLabel(moduleId: ModuleId, labelId: LabelId) {
    await deleteLabelDb(labelId);
    await deleteLabelingOnCardsByLabelIdDb(labelId);

    // Sync updated labels to clients
    await syncModuleLabels(moduleId);
}

export async function updateBoardLabels(updatedLabel: Label) {
    const label = await labelHandler.read(updatedLabel.id);
    if (!label) {
        throw new Error('Label does not exist');
    }
    await labelHandler.update(updatedLabel.id, updatedLabel, { preventSync: true });
    // Sync updated labels to clients
    await syncLabel(updatedLabel.id);
}

export const getLabelsModule = async (labelId: LabelId): Promise<ModuleId> => {
    const label = await labelHandler.read(labelId);
    if (!label) {
        throw new Error('Label not found');
    }
    return label.boardId;
};
