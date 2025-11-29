import { ModuleHeader, ModuleHeaderWithChildren, PermissionLevel, PermissionRecord, UID, UserId } from '../types';

/**
 * Returns the maximum of two permission levels, treating undefined or null as PermissionLevel.NONE.
 */
export const maxPermissionLevel = (levelA: PermissionLevel | undefined | null, levelB: PermissionLevel | undefined | null) => {
    const a = levelA ?? PermissionLevel.NONE;
    const b = levelB ?? PermissionLevel.NONE;
    return Math.max(a, b);
};

/**
 * Overlays childPermissions on top of parentPermissions, returning the merged result.
 * For each permission level (anyone, org, user), the higher of the two levels is taken.
 */
export const overlayPermissionLevels = (parentPermissions: PermissionRecord, childPermissions: PermissionRecord) => {
    const anyonePermissionLevel = maxPermissionLevel(parentPermissions.anyonePermissionLevel, childPermissions.anyonePermissionLevel);
    const orgPermissionLevel = maxPermissionLevel(parentPermissions.orgPermissionLevel, childPermissions.orgPermissionLevel);
    const userPermissionLevels: Record<UserId, PermissionLevel> = { ...childPermissions.userPermissionLevels };
    for (const [userId, level] of Object.entries(parentPermissions.userPermissionLevels)) {
        // explicitly cast userId to UserId type because for some reason TS infers the record iterator key as string
        const existingLevel = userPermissionLevels[userId as UserId];
        userPermissionLevels[userId as UserId] = maxPermissionLevel(level, existingLevel);
    }
    const mergedPermissions: PermissionRecord = {
        anyonePermissionLevel,
        orgPermissionLevel,
        userPermissionLevels,
    };
    return mergedPermissions;
};

/**
 * Calculates the effective permissions for all modules in the org, starting from the root module.
 * Effective permissions are calculated by overlaying parent module permissions onto child modules.
 */
export const calculateEffectivePermissions = (allModules: ModuleHeader[], rootOfAllModules: ModuleHeader) => {
    // So that we dont need to filter every time, cache child modules by parentId
    const moduleParentMap: Record<UID, ModuleHeader[]> = {};
    for (const mod of allModules) {
        if (!moduleParentMap[mod.parentId]) {
            moduleParentMap[mod.parentId] = [];
        }
        moduleParentMap[mod.parentId].push(mod);
    }

    /**
     * Recursively calculates effective permissions for child modules given a parent module.
     */
    const recursivelyCalculateEffectivePermissions = (parentModule: ModuleHeader): ModuleHeaderWithChildren[] => {
        const childModules = moduleParentMap[parentModule.id] || [];
        const updatedChildModules: ModuleHeaderWithChildren[] = [];
        for (const childModule of childModules) {
            const mergedPermissions = overlayPermissionLevels(parentModule, childModule);
            const updatedChildModule: ModuleHeaderWithChildren = {
                ...childModule,
                anyonePermissionLevel: mergedPermissions.anyonePermissionLevel,
                orgPermissionLevel: mergedPermissions.orgPermissionLevel,
                userPermissionLevels: mergedPermissions.userPermissionLevels,
            };
            updatedChildModule.children = recursivelyCalculateEffectivePermissions(updatedChildModule);
            updatedChildModules.push(updatedChildModule);
        }
        return updatedChildModules;
    };
    const effectiveModules = recursivelyCalculateEffectivePermissions(rootOfAllModules);
    return effectiveModules;
};
