import { ObjectSource, ObjectSourceHandler } from '@mosaiq/terrazzo-common';

export const textBlockHandler: ObjectSourceHandler<ObjectSource.TextBlock> = {
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
