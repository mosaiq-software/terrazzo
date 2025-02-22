export type URL = string;
export type UID = string;
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
    logoUrl: URL;
}
export interface Organization extends OrganizationHeader{
    projects: ProjectHeader[];
}

export interface ProjectHeader {
    id: ProjectId;
    name: string;
    logoUrl: URL;
}
export interface Project extends ProjectHeader{
    boards: BoardHeader[];
}

export interface BoardHeader {
    id: BoardId;
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
    listId: ListId;
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

export interface User {
    id: UserId;
    fullName: string;
    discordUserId: string;
    githubUserId: string;
    activeTimerId: string;
    archived: boolean;
}

export interface Comment {
    id: CommentId;
    content: string;
    postedAt: Date;
    postedBy: User;
    archived: boolean;
}

export enum Priority {
    LOWEST = 1,
    LOW = 2,
    MEDIUM = 3,
    HIGH = 4,
    HIGHEST = 5
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