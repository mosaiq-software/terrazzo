import { ObjectSource, ObjectSourceHandler } from '@mosaiq/terrazzo-common';

export const textBlockSnapshotHandler: ObjectSourceHandler<ObjectSource.TextBlockSnapshot> = {
    create: async (data) => {
        void data;
        return;
    },
    update: async (id, data) => {
        void id;
        void data;
        return;
    },
    read: async (id) => {
        void id;
        return undefined;
    },
};
