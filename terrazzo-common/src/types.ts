import { Priority, StoryPoints } from './constants';

export type URL = string;
export type UID = `${string}-${string}-${string}-${string}-${string}`;
export type OrganizationId = UID;
export type BoardId = UID;
export type ListId = UID;
export type CardId = UID;
export type UserId = UID;
export type TextBlockId = UID;
export type LabelId = UID;
export type InviteId = UID;
export type AssignmentId = UID;
export type DocumentId = UID;
export type DirectoryId = UID;

export interface OrganizationHeader {
    id: OrganizationId;
    name: string;
    archived: boolean;
    createdAt: number;
    logoUrl: URL;
    isPersonalOrg: boolean;
    description: string;
}
export interface Organization extends OrganizationHeader {
    members: Member[];
    invites: Invite[];
    modules: TrzModule[];
}

export interface BoardHeader extends ModuleHeader {
    type: TrzModuleType.Board;
    boardCode: string;
    totalCards: number;
}
export interface Board extends BoardHeader {
    lists: List[];
    labels: Label[];
    members: Member[];
}
export interface BoardRes extends Omit<Board, 'lists'> {
    lists: { listId: ListId; cardIds: CardId[] }[];
}

export interface ListHeader {
    id: ListId;
    boardId: BoardId;
    name: string;
    archived: boolean;
    order: number;
}
export interface List extends ListHeader {
    cards: Card[];
}

export interface CardHeader {
    id: CardId;
    listId: ListId;
    cardNumber: number;
    name: string;
    priority: Priority | null;
    storyPoints: StoryPoints | null;
    archived: boolean;
    order: number;
    descriptionTextBlockId: TextBlockId;
    createdAt: number;
    createdById: UserId | null;
}
export interface Card extends CardHeader {
    labels: LabelId[];
    assignees: UserId[];
    createdBy: UserHeader | null;
}

export interface UserHeader {
    id: UserId;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: URL;
    githubUserId: string;
}
export interface User extends UserHeader {
    organizationIds: OrganizationId[];
}

export interface Label {
    id: LabelId;
    name: string;
    color: string;
}

export interface TextBlock {
    id: TextBlockId;
    text: string;
}

export enum PermissionLevel {
    VIEW,
    EDIT,
    ADMIN,
}

export interface MembershipRecord {
    userId: UserId;
    orgId: OrganizationId;
    permissionLevel: PermissionLevel;
}
export interface Member {
    user: UserHeader;
    record: MembershipRecord;
}

export interface InviteRecord {
    id: InviteId;
    toUser: UserId;
    fromUser: UserId;
    createdAt: number;
    entityId: UID;
    userRole: PermissionLevel;
}
export interface Invite {
    id: InviteId;
    toUser: UserHeader;
    fromUser: UserHeader;
    createdAt: number;
    entity: OrganizationHeader;
    userRole: PermissionLevel;
}

export interface GithubUserProfile {
    id: string;
    login: string;
    avatar_url: URL;
    name: string;
}

export interface Assignment {
    id: AssignmentId;
    userId: UserId;
    cardId: CardId;
}

export type NonEmptyArray<T> = [T, ...T[]];

export enum DatapointType {
    BoardTitle = 'board.title',
    CardTitle = 'card.title',
    CardDescription = 'card.description',
    DocumentTitle = 'document.title',
    DocumentContent = 'document.content',
}
export interface QueryableDatapoint {
    title: string;
    display: string;
    content: string;
    id: UID;
    type: DatapointType;
}

export interface QueryResult extends QueryableDatapoint {
    score: number;
}

export interface DocumentHeader extends ModuleHeader {
    type: TrzModuleType.Document;
    textBlockId: TextBlockId;
    lastModifiedAt: number;
    lastModifiedByUserId: UserId;
}

export interface DirectoryHeader extends ModuleHeader {
    type: TrzModuleType.Directory;
}
export interface Directory extends DirectoryHeader {
    modules: TrzModule[];
}

export enum TrzModuleType {
    Directory = 'directory',
    Document = 'document',
    Board = 'board',

    /** Technically an org is just a top-level module, but we should never use it as one */
    Organization = 'organization',
}
export type TrzModule = DirectoryHeader | DocumentHeader | BoardHeader;

interface BaseDirectoryListItem {
    moduleId: UID;
    moduleName: string;
}
interface DirectoryDirectoryListItem extends BaseDirectoryListItem {
    moduleType: TrzModuleType.Directory;
    subItems: DirectoryListItem[];
}
interface OtherDirectoryListItem extends BaseDirectoryListItem {
    moduleType: Exclude<TrzModuleType, TrzModuleType.Directory>;
}

export type DirectoryListItem = DirectoryDirectoryListItem | OtherDirectoryListItem;
export type DirectoryList = DirectoryListItem[];

export interface ModuleHeader {
    id: UID;
    parentId: UID;
    name: string;
    archived: boolean;
    createdAt: number;
    type: TrzModuleType;
    orgId: OrganizationId;
    anyonePermissionLevel: PermissionLevel | null;
    orgPermissionLevel: PermissionLevel | null;
    userPermissionLevels: Record<UserId, PermissionLevel>;
}
