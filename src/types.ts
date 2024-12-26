export interface Card {
    id: string;
    cardCode: string;
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
}

export interface List {
    id: string;
    name: string;
    cards: Card[];
}

export interface Board {
    id: string;
    boardCode: string;
    name: string;
    lists: List[];
    members: BoardMember[];
    sprints: Sprint[];
    labels: Label[];
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
    timer: Timer;
}

export interface BoardMember extends User {
    role: Role;
}

export enum Role {
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    GUEST = 'GUEST'
}

export interface Comment {
    id: string;
    content: string;
    postedAt: Date;
    postedBy: User;
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
};

export interface TimesheetEntry {
    id: string;
    startedAt: Date;
    endedAt: Date;
    description: string;
    userId: string;
}

export interface Timer {
    running: boolean;
    timesheetEntryId: string;
}

export interface EventLog {
    id: string;
    type: EventType;
    timestamp: Date;
    userId: string; // User who triggered the event
    itemId: string; // Board, List, Card, Sprint, User, Comment, Checklist, ChecklistItem, Label, TimesheetEntry
    initialData: any;
    updatedData: any;
}

export enum EventType {
    BOARD_CREATED = 'BOARD_CREATED',
    BOARD_UPDATED = 'BOARD_UPDATED',
    BOARD_DELETED = 'BOARD_DELETED',
    LIST_CREATED = 'LIST_CREATED',
    LIST_UPDATED = 'LIST_UPDATED',
    LIST_DELETED = 'LIST_DELETED',
    CARD_CREATED = 'CARD_CREATED',
    CARD_UPDATED = 'CARD_UPDATED',
    CARD_DELETED = 'CARD_DELETED',
    SPRINT_STARTED = 'SPRINT_STARTED',
    SPRINT_ENDED = 'SPRINT_ENDED',
    USER_ADDED_TO_BOARD = 'USER_ADDED_TO_BOARD',
    USER_REMOVED_FROM_BOARD = 'USER_REMOVED_FROM_BOARD',
    USER_PERMISSION_CHANGED = 'USER_PERMISSION_CHANGED',
    COMMENT_ADDED = 'COMMENT_ADDED',
    COMMENT_DELETED = 'COMMENT_DELETED',
    CHECKLIST_CREATED = 'CHECKLIST_CREATED',
    CHECKLIST_UPDATED = 'CHECKLIST_UPDATED',
    CHECKLIST_DELETED = 'CHECKLIST_DELETED',
    CHECKLIST_ITEM_CREATED = 'CHECKLIST_ITEM_CREATED',
    CHECKLIST_ITEM_UPDATED = 'CHECKLIST_ITEM_UPDATED',
    CHECKLIST_ITEM_DELETED = 'CHECKLIST_ITEM_DELETED',
    LABEL_CREATED = 'LABEL_CREATED',
    LABEL_UPDATED = 'LABEL_UPDATED',
    LABEL_DELETED = 'LABEL_DELETED',
    TIMESHEET_ENTRY_STARTED = 'TIMESHEET_ENTRY_STARTED',
    TIMESHEET_ENTRY_UPDATED = 'TIMESHEET_ENTRY_UPDATED',
    TIMESHEET_ENTRY_ENDED = 'TIMESHEET_ENTRY_ENDED',
    TIMER_STARTED = 'TIMER_STARTED',
    TIMER_STOPPED = 'TIMER_STOPPED'
}