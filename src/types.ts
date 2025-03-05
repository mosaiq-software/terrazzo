import { EntityType, Priority, Role } from "./constants";

export type URL = string;
export type UID = `${string}-${string}-${string}-${string}-${string}`;
export type OrganizationId = UID;
export type ProjectId = UID;
export type BoardId = UID;
export type ListId = UID;
export type CardId = UID;
export type UserId = UID;
export type TextBlockId = UID;
export type LabelId = UID;
export type CommentId = UID;
export type InviteId = UID;
export type MembershipRecordId = UID;
export type EntityId = ProjectId | OrganizationId;

export interface OrganizationHeader {
    id: OrganizationId;
    name: string;
    archived: boolean;
    createdAt: number;
    logoUrl: URL;
    isPersonalOrg: boolean;
    description: string;
}
export interface Organization extends OrganizationHeader{
    members: Member[];
    projects: ProjectHeader[];
    invites: Invite[];
}

export interface ProjectHeader {
    id: ProjectId;
    orgId: OrganizationId;
    name: string;
    archived: boolean;
    createdAt: number;
    logoUrl: URL;
    description: string;
}
export interface Project extends ProjectHeader{
    members: Member[];
    boards: BoardHeader[];
    invites: Invite[];
}

export interface BoardHeader {
    id: BoardId;
    projectId: ProjectId;
    boardCode: string;
    name: string;
    archived: boolean;
    createdAt: number;
    totalCards: number;
}
export interface Board extends BoardHeader{
    lists: List[];
    sprints: Sprint[];
    labels: Label[];
}

export interface ListHeader {
    id: ListId;
    boardId: BoardId;
    name: string;
    archived: boolean;
    order: number;
}
export interface List extends ListHeader{
    cards: CardHeader[];
}

export interface CardHeader {
    id: CardId;
    listId: ListId | null;
    cardNumber: number;
    name: string;
    priority: Priority | null;
    storyPoints: number;
    sprintId: string;
    archived: boolean;
    order: number;
    descriptionTextBlockId: TextBlockId;
}
export interface Card extends CardHeader{
    comments: CommentId[];
    labels: LabelId[];
    assignees: UserId[];
}

export interface Sprint {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
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
    projectIds: ProjectId[];
    organizationIds: OrganizationId[];
}

export interface Comment {
    id: CommentId;
    content: string;
    postedAt: Date;
    postedBy: UserId;
    archived: boolean;
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
export interface TextBlockEvent {
    id: TextBlockId;
    start: number;
    end: number;
    inserted: string;
}

export interface MembershipRecord {
    id: MembershipRecordId;
    userId: UserId;
    entityId: EntityId;
    entityType: EntityType;
    userRole: Role;
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
    entityId: EntityId;
    entityType: EntityType;
    userRole: Role;
}
export interface Invite {
    id: InviteId;
    toUser: UserHeader;
    fromUser: UserHeader;
    createdAt: number;
    entity: OrganizationHeader | ProjectHeader;
    entityType: EntityType;
    userRole: Role;
}

export interface UserDashOrganization extends OrganizationHeader {
    projects: ProjectHeader[];
    members: Member[];
}
export interface UserDashProject extends ProjectHeader {
    members: Member[];
}
export interface UserDash {
    organizations: UserDashOrganization[];
    standaloneProjects: UserDashProject[];
    invites: Invite[];
}

export interface GithubUserProfile {
    id: string,
    login: string,
    avatar_url: URL,
    name: string,
}