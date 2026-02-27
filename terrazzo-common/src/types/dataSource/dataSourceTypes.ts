import { UID } from '../genericTypes';
import { CollectionSource, CollectionSourceDataMap } from './collectionSources';
import { ObjectSource, ObjectSourcesMap } from './objectSources';

export type CreateObjectSourceDataInstance<T extends ObjectSource> = ObjectSourcesMap[T]['create'];
export type UpdateObjectSourceDataInstance<T extends ObjectSource> = ObjectSourcesMap[T]['update'];
export type ObjectSourceDataInstance<T extends ObjectSource> = ObjectSourcesMap[T]['data'];
export type CollectionSourceOf<T extends CollectionSource> = CollectionSourceDataMap[T]['of'];

type CollectionSourceKeyMap = {
    [T in CollectionSource]: CollectionSourceDataMap[T] extends { key: infer K } ? K : UID;
};
export type CollectionSourceKey<T extends CollectionSource> = CollectionSourceKeyMap[T];

export type CollectionSourceDataInstance<T extends CollectionSource> = CollectionSourceOf<T>[];

export type EditableCollectionSource = {
    [T in CollectionSource]: CollectionSourceDataMap[T]['editable'] extends true ? T : never;
}[CollectionSource];

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
        id: CollectionSourceKey<T>;
        type: T;
        data: CollectionSourceDataInstance<T>;
    };
};

export type CollectionSourceDataPayload<T extends CollectionSource> = CollectionSourceUpdatePayloadMap[T];
export type CollectionSourceData = CollectionSourceDataPayload<CollectionSource>;

export interface ObjectSourceCreateOptions {
    preventSync?: boolean;
}
export interface ObjectSourceUpdateOptions {
    preventSync?: boolean;
}
export interface ObjectSourceReadOptions {}

export interface ObjectSourceHandler<T extends ObjectSource> {
    create: (data: CreateObjectSourceDataInstance<T>, options?: ObjectSourceCreateOptions) => Promise<UID>;
    update: (
        id: UID,
        data: Partial<UpdateObjectSourceDataInstance<T>>,
        options?: ObjectSourceUpdateOptions
    ) => Promise<void>;
    read: (id: UID, options?: ObjectSourceReadOptions) => Promise<ObjectSourceDataInstance<T> | undefined>;
}

export interface CollectionSourceReadOptions {}
export interface CollectionSourceAddOptions {
    preventSync?: boolean;
}
export interface CollectionSourceRemoveOptions {
    preventSync?: boolean;
}

export interface CollectionSourceReadHandler<T extends CollectionSource> {
    read: (parentId: CollectionSourceKey<T>, options?: CollectionSourceReadOptions) => Promise<CollectionSourceOf<T>[]>;
}

export interface CollectionSourceEditableHandler<T extends CollectionSource> extends CollectionSourceReadHandler<T> {
    add: (
        parentId: CollectionSourceKey<T>,
        itemIds: CollectionSourceOf<T>[],
        options?: CollectionSourceAddOptions
    ) => Promise<void>;
    remove: (
        parentId: CollectionSourceKey<T>,
        itemIds: CollectionSourceOf<T>[],
        options?: CollectionSourceRemoveOptions
    ) => Promise<void>;
}

export type CollectionSourceHandler<T extends CollectionSource> = CollectionSourceDataMap[T]['editable'] extends true
    ? CollectionSourceEditableHandler<T>
    : CollectionSourceReadHandler<T>;

export type ObjectSourceController = {
    [T in ObjectSource]: ObjectSourceHandler<T>;
};

export type CollectionSourceController = {
    [T in CollectionSource]: CollectionSourceHandler<T>;
};
