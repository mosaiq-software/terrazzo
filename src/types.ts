import { Role, EventType } from './constants';

export interface Card {
    id: string;
    listId: string;
    cardNumber: string;
    name: string;
    description: string;
    priority: Priority;
    storyPoints: number;
    sprintId: string;
    assignees: User[];
    comments: Comment[];
    checklists: Checklist[];
    labels: Label[];
    timesheetEntries: TimesheetEntry[];
    archived: boolean;
    order: number;
}

export interface List {
    id: string;
    boardId: string;
    name: string;
    cards: Card[];
    archived: boolean;
    order: number;
}

export interface Board {
    id: string;
    boardCode: string;
    name: string;
    lists: List[];
    members: BoardMember[];
    sprints: Sprint[];
    labels: Label[];
    archived: boolean;
    createdAt: number;
    totalCards: number;
}

export interface Sprint {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
}

export interface User {
    id: string;
    fullName: string;
    discordUserId: string;
    githubUserId: string;
    activeTimerId: string;
    archived: boolean;
}

export interface BoardMember extends User {
    role: Role;
}

export interface Comment {
    id: string;
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

export interface Checklist {
    id: string;
    name: string;
    items: ChecklistItem[];
    archived: boolean;
}

export interface ChecklistItem {
    id: string;
    name: string;
    checked: boolean;
}

export interface Label {
    id: string;
    name: string;
    color: string;
}

export interface TimesheetEntry {
    id: string;
    startedAt: Date;
    endedAt: Date;
    description: string;
    userId: string;
    cardId: string;
    archived: boolean;
}

export interface EventLog {
    id: string;
    type: EventType;
    timestamp: Date;
    userId: string; // User who triggered the event
    itemId: string; // Board, List, Card, Sprint, User, Comment, Checklist, ChecklistItem, Label, TimesheetEntry
    oldValue: any;
    newValue: any;
}