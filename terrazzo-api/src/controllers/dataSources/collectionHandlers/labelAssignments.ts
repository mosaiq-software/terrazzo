import { CollectionSource, CollectionSourceHandler, LabelId } from '@mosaiq/terrazzo-common';
import { getLabelsOnCardDb, setLabelsOnCardDb } from '@trz-api/persistence/labelAssignmentPersistence';

export const labelAssignmentsCollectionHandler: CollectionSourceHandler<CollectionSource.LabelAssignments> = {
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
};
