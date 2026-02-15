import { Label, LabelId, ModuleId } from '@mosaiq/terrazzo-common';
import { syncBoardLabels } from '@trz-api/broadcasters/labelBroadcaster';
import { deleteLabelingOnCardsByLabelIdDb } from '@trz-api/persistence/labelAssignmentPersistence';
import {
    createLabelOnBoardDb,
    deleteLabelDb,
    getLabelByIdDb,
    getLabelsByBoardIdDb,
    updateLabelDb,
} from '@trz-api/persistence/labelPersistence';

export async function createBoardLabel(boardId: ModuleId, name: string, color: string): Promise<LabelId> {
    const label: Label = {
        name,
        color,
        boardId,
        id: crypto.randomUUID(),
    };
    await createLabelOnBoardDb(label, boardId);

    // Sync updated labels to clients
    const labels = await getLabelsByBoardIdDb(boardId);
    await syncBoardLabels(boardId, labels);

    return label.id;
}

export async function createBoardLabelSingle(boardId: ModuleId, name: string, color: string): Promise<LabelId> {
    const label: Label = {
        name,
        color,
        boardId,
        id: crypto.randomUUID(),
    };
    await createLabelOnBoardDb(label, boardId);
    return label.id;
}

export async function removeBoardLabel(boardId: ModuleId, labelId: LabelId) {
    await deleteLabelDb(labelId);
    await deleteLabelingOnCardsByLabelIdDb(labelId);

    // Sync updated labels to clients
    const labels = await getLabelsByBoardIdDb(boardId);
    await syncBoardLabels(boardId, labels);
}

export async function updateBoardLabels(boardId: ModuleId, updatedLabel: Label) {
    const label = await getLabelByIdDb(updatedLabel.id);
    if (!label) {
        throw new Error('Label does not exist');
    }

    await updateLabelDb(updatedLabel);

    // Sync updated labels to clients
    const labels = await getLabelsByBoardIdDb(boardId);
    await syncBoardLabels(boardId, labels);
}
