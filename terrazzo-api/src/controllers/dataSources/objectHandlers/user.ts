import { ObjectSource, ObjectSourceHandler } from '@mosaiq/terrazzo-common';

export const userHandler: ObjectSourceHandler<ObjectSource.User> = {
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
