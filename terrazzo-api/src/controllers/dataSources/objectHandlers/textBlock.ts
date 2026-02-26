import { ObjectSource, ObjectSourceCreateOptions } from '@mosaiq/terrazzo-common';

export const textBlockHandler: ObjectSourceCreateOptions<ObjectSource.TextBlock> = {
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
