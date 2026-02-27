import { ObjectSource, ObjectSourceHandler } from '@mosaiq/terrazzo-common';
import { syncObjectSource } from '@trz-api/broadcasters';

export const objectSourceHandlers = <T extends ObjectSource>(
    type: T,
    handler: ObjectSourceHandler<T>
): ObjectSourceHandler<T> => {
    return {
        create: async (data, options) => {
            try {
                const id = await handler.create(data, options);
                if (!options?.preventSync) {
                    try {
                        await syncObjectSource(id, type);
                    } catch (e) {
                        console.error(`Failed to sync new object source`, {
                            id,
                            type,
                            error: e,
                        });
                    }
                }
                return id;
            } catch (e) {
                console.error(`Error in create handler for object source`, {
                    type,
                    error: e,
                });
                throw e;
            }
        },
        update: async (id, data, options) => {
            try {
                await handler.update(id, data, options);
                if (!options?.preventSync) {
                    try {
                        await syncObjectSource(id, type);
                    } catch (e) {
                        console.error(`Failed to sync updated object source`, {
                            id,
                            type,
                            error: e,
                        });
                    }
                }
            } catch (e) {
                console.error(`Error in update handler for object source`, {
                    id,
                    type,
                    error: e,
                });
                throw e;
            }
        },
        read: async (id) => {
            try {
                return await handler.read(id);
            } catch (e) {
                console.error(`Error in read handler for object source`, {
                    id,
                    type,
                    error: e,
                });
                throw e;
            }
        },
    };
};
