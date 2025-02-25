export enum LocalStorageKey {
    GITHUB_ACCESS_TOKEN = 'GITHUB_ACCESS_TOKEN',
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

export enum EntityType {
    PROJECT = 0,
    ORG = 1,
}