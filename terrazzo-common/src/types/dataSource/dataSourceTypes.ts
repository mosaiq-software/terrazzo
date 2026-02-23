import { UID } from '../genericTypes';
import { CollectionSource, CollectionSourceDataMap } from './collectionSources';
import { ObjectSource, ObjectSourcesMap } from './objectSources';

export type CreateObjectSourceDataInstance<T extends ObjectSource> = ObjectSourcesMap[T]['create'];
export type UpdateObjectSourceDataInstance<T extends ObjectSource> = ObjectSourcesMap[T]['update'];
export type ObjectSourceDataInstance<T extends ObjectSource> = ObjectSourcesMap[T]['data'];
export type CollectionSourceDataInstance<T extends CollectionSource> = CollectionSourceDataMap[T];

export type CreateObjectSourceData = {
    [T in ObjectSource]: {
        type: T;
        data: CreateObjectSourceDataInstance<T>;
    };
}[ObjectSource];

export type UpdateObjectSourceData = {
    [T in ObjectSource]: {
        type: T;
        data: UpdateObjectSourceDataInstance<T>;
    };
}[ObjectSource];

type ObjectSourceDataPayloadMap = {
    [T in ObjectSource]: {
        type: T;
        data: ObjectSourceDataInstance<T>;
    };
};

export type ObjectSourceDataPayload<T extends ObjectSource> = ObjectSourceDataPayloadMap[T];
export type ObjectSourceData = ObjectSourceDataPayload<ObjectSource>;

type CollectionSourceUpdatePayloadMap = {
    [T in CollectionSource]: {
        id: UID;
        type: T;
        data: CollectionSourceDataInstance<T>;
    };
};

export type CollectionSourceDataPayload<T extends CollectionSource> = CollectionSourceUpdatePayloadMap[T];
export type CollectionSourceData = CollectionSourceDataPayload<CollectionSource>;

export interface ObjectSourceHandler<T extends ObjectSource> {
    create: (data: CreateObjectSourceDataInstance<T>) => Promise<void>;
    update: (id: UID, data: Partial<UpdateObjectSourceDataInstance<T>>) => Promise<void>;
    read: (id: UID) => Promise<ObjectSourceDataInstance<T> | undefined>;
}

export interface CollectionSourceHandler<T extends CollectionSource> {
    read: (parentId: UID) => Promise<CollectionSourceDataMap[T] | undefined>;
    add: (parentId: UID, itemIds: UID[]) => Promise<void>;
    remove: (parentId: UID, itemIds: UID[]) => Promise<void>;
}

export type ObjectSourceController = {
    [T in ObjectSource]: ObjectSourceHandler<T>;
};

export type CollectionSourceController = {
    [T in CollectionSource]: CollectionSourceHandler<T>;
};
