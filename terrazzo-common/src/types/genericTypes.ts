export type NonEmptyArray<T> = [T, ...T[]];

export type URL = string;
export type UID = `${string}-${string}-${string}-${string}-${string}`;
export type OrganizationId = UID;
export type ListId = UID;
export type CardId = UID;
export type UserId = UID;
export type TextBlockId = UID;
export type TextBlockSnapshotId = UID;
export type LabelId = UID;
export type InviteId = UID;
export type AssignmentId = UID;
export type RoleId = UID;
export type UploadedFileId = UID;
export type ModuleId = UID;

export type Position = { x: number; y: number };

export type JSONType = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONType };
export type JSONArray = JSONType[];
