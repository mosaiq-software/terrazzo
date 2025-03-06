export enum LocalStorageKey {
    GITHUB_ACCESS_TOKEN = 'GITHUB_ACCESS_TOKEN',
    SIDEBAR_COLLAPSED = 'SIDEBAR_COLLAPSED',
}

export enum Priority {
    LOWEST = 1,
    LOW = 2,
    MEDIUM = 3,
    HIGH = 4,
    HIGHEST = 5
}

export enum Role {
    READ = 1,
    WRITE = 2,
    ADMIN = 3,
    OWNER = 4,
}

export const RoleNames = [
    "None",   // 0
    "Guest",  // 1
    "Member", // 2
    "Admin",  // 3
    "Owner",  // 4
]

export enum EntityType {
    PROJECT = 0,
    ORG = 1,
}

export enum StoryPoints{
    ZERO = 0,
    XXS = 1,
    XS = 2,
    S = 3,
    M = 5,
    L = 8,
    XL = 13,
    XXL = 21,
}