import {
    CollectionSource,
    CollectionSourceEditableHandler,
    CollectionSourceReadHandler,
    EditableCollectionSource,
    ObjectSource,
    ObjectSourceHandler,
} from '@mosaiq/terrazzo-common';
import { syncCollectionSource, syncObjectSource } from '@trz-api/broadcasters';

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

export const collectionSourceReadHandlers = <T extends CollectionSource>(
    type: T,
    handler: CollectionSourceReadHandler<T>
): CollectionSourceReadHandler<T> => {
    return {
        read: async (parentId, options) => {
            try {
                return await handler.read(parentId, options);
            } catch (e) {
                console.error(`Error in read handler for collection source`, {
                    parentId,
                    type,
                    error: e,
                });
                throw e;
            }
        },
    };
};

export const collectionSourceEditableHandlers = <T extends EditableCollectionSource>(
    type: T,
    handler: CollectionSourceEditableHandler<T>
): CollectionSourceEditableHandler<T> => {
    return {
        read: async (parentId, options) => {
            try {
                return await handler.read(parentId, options);
            } catch (e) {
                console.error(`Error in read handler for collection source`, {
                    parentId,
                    type,
                    error: e,
                });
                throw e;
            }
        },
        add: async (parentId, itemIds, options) => {
            try {
                await handler.add(parentId, itemIds, options);
                if (!options?.preventSync) {
                    try {
                        await syncCollectionSource(parentId, type);
                    } catch (e) {
                        console.error(`Failed to sync collection source after add`, {
                            parentId,
                            type,
                            error: e,
                        });
                    }
                }
            } catch (e) {
                console.error(`Error in add handler for collection source`, {
                    parentId,
                    type,
                    error: e,
                });
                throw e;
            }
        },
        remove: async (parentId, itemIds, options) => {
            try {
                await handler.remove(parentId, itemIds, options);
                if (!options?.preventSync) {
                    try {
                        await syncCollectionSource(parentId, type);
                    } catch (e) {
                        console.error(`Failed to sync collection source after remove`, {
                            parentId,
                            type,
                            error: e,
                        });
                    }
                }
            } catch (e) {
                console.error(`Error in remove handler for collection source`, {
                    parentId,
                    type,
                    error: e,
                });
                throw e;
            }
        },
    };
};
