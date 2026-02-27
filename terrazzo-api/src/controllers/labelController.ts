import { LabelId, ModuleId } from '@mosaiq/terrazzo-common';
import { getLabelIdsByBoardIdDb } from '@trz-api/persistence/labelPersistence';
import { labelHandler } from './dataSources/objectHandlers/label';

export const getLabelIdsOnModule = async (moduleId: ModuleId): Promise<LabelId[]> => {
    const labels = await getLabelIdsByBoardIdDb(moduleId);
    return labels;
};

export const getLabelsModule = async (labelId: LabelId): Promise<ModuleId> => {
    const label = await labelHandler.read(labelId);
    if (!label) {
        throw new Error('Label not found');
    }
    return label.boardId;
};
