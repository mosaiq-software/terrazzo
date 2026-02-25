import { ObjectSource, ObjectSourceHandler } from '@mosaiq/terrazzo-common';

export const listHandler: ObjectSourceHandler<ObjectSource.List> = {
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
