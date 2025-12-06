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
export type RoleId = UID;

export interface OrganizationHeader {
    id: OrganizationId;
    name: string;
    createdAt: number;
    logoUrl: URL;
    description: string;
}

export interface BoardHeader extends ModuleHeader {
    type: TrzModuleType.Board;
    boardCode: string;
    totalCards: number;
}
export interface Board extends BoardHeader {
    lists: List[];
    labels: Label[];
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
    createdBy: UserHeader | undefined;
}

export interface UserHeader {
    id: UserId;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: URL;
    githubUserId: string;
}

export interface Label {
    id: LabelId;
    boardId: BoardId;
    name: string;
    color: string;
}

export interface TextBlock {
    id: TextBlockId;
    text: string;
}

export enum OrgMembershipLevel {
    MEMBER,
    ADMIN,
}

export interface MembershipRecord {
    userId: UserId;
    orgId: OrganizationId;
    permissionLevel: OrgMembershipLevel;
}
export interface Member {
    user: UserHeader;
    record: MembershipRecord;
}

export interface Invite {
    id: InviteId;
    forOrganizationId: OrganizationId;
    maxUses: number | null;
    uses: number;
    createdById: UserId;
    createdAt: number;
    revokedAt: number | null;
}

export interface GithubUserProfile {
    id: string;
    login: string;
    avatar_url: URL;
    name: string;
}

export interface CardAssignment {
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

export interface MinimalModuleHeader {
    id: UID;
    parentId: UID;
    name: string;
    type: TrzModuleType;
    order: number;
}
export interface ModuleHeader extends MinimalModuleHeader {
    archived: boolean;
    createdAt: number;
    orgId: OrganizationId;
    desiredPermissions: ModulePermissions;
    effectivePermissions: ModulePermissions;
}

export interface Role {
    id: RoleId;
    orgId: OrganizationId;
    name: string;
    color: string;
    order: number;
    defaultPermissions: PermissionFlag[];
}

export type OverridePermissions = Partial<Record<PermissionFlag, boolean>>;
export type ModulePermissions = Record<RoleId, OverridePermissions>;

export enum PermissionFlag {
    DUMMY_1 = 'DUMMY_1',
    DUMMY_2 = 'DUMMY_2',
    DUMMY_3 = 'DUMMY_3',
}
export interface PermissionFlagData {
    flag: PermissionFlag;
    title: string;
    description: string;
}
export const PermissionFlagData: Record<PermissionFlag, PermissionFlagData> = {
    [PermissionFlag.DUMMY_1]: {
        flag: PermissionFlag.DUMMY_1,
        title: 'Dummy Permission 1',
        description: 'This is a dummy permission for testing purposes.',
    },
    [PermissionFlag.DUMMY_2]: {
        flag: PermissionFlag.DUMMY_2,
        title: 'Dummy Permission 2',
        description: 'This is another dummy permission for testing purposes.',
    },
    [PermissionFlag.DUMMY_3]: {
        flag: PermissionFlag.DUMMY_3,
        title: 'Dummy Permission 3',
        description: 'This is yet another dummy permission for testing purposes.',
    },
};
