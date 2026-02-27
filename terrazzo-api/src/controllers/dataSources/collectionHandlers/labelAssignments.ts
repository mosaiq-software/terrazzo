import { CollectionSource, LabelId } from '@mosaiq/terrazzo-common';
import { getLabelsOnCardDb, setLabelsOnCardDb } from '@trz-api/persistence/labelAssignmentPersistence';
import { collectionSourceEditableHandlers } from '../dataSourceWrapper';

export const labelAssignmentsCollectionHandler = collectionSourceEditableHandlers(CollectionSource.LabelAssignments, {
    read: async (parentId) => {
        return await getLabelsOnCardDb(parentId);
    },
    add: async (parentId, itemIds) => {
        const current = await getLabelsOnCardDb(parentId);
        const next = new Set<LabelId>(current);
        for (const id of itemIds) next.add(id);
        await setLabelsOnCardDb(parentId, Array.from(next));
    },
    remove: async (parentId, itemIds) => {
        const current = await getLabelsOnCardDb(parentId);
        const remove = new Set<LabelId>(itemIds);
        const next = current.filter((id) => !remove.has(id));
        await setLabelsOnCardDb(parentId, next);
    },
});
