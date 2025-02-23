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

export interface OrganizationHeader {
    id: OrganizationId;
    name: string;
    archived: boolean;
    createdAt: number;
    logoUrl: URL;
    isPersonalOrg: boolean;
}
export interface Organization extends OrganizationHeader{
    projects: ProjectHeader[];
}

export interface ProjectHeader {
    id: ProjectId;
    orgId: OrganizationId;
    name: string;
    archived: boolean;
    createdAt: number;
    logoUrl: URL;
}
export interface Project extends ProjectHeader{
    boards: BoardHeader[];
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

export interface List {
    id: ListId;
    boardId: BoardId;
    name: string;
    archived: boolean;
    order: number;
    cards: CardHeader[];
}

export interface CardHeader {
    id: CardId;
    listId: ListId | null;
    cardNumber: number;
    name: string;
    priority: Priority;
    storyPoints: number;
    sprintId: string;
    archived: boolean;
    order: number;
    labels: Label[];
    assignees: User[];
}
export interface Card extends CardHeader{
    descriptionTextBlockId: TextBlockId;
    comments: Comment[];
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
    postedBy: User;
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
    id: UID;
    userId: UserId;
    entityId: ProjectId|OrganizationId;
    entityType: EntityType;
    role: Role;
}