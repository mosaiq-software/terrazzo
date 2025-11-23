import { DirectoryList, ModuleHeader, OrganizationId, TrzModuleType, UID, UserId } from '@mosaiq/terrazzo-common/types';
import { getModuleByIdDb, getModulesByParentIdDb } from '@trz-api/persistence/modulePersistence';
import { getOrganizationMembershipsForOrg, getOrganizationMembershipsForUser } from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';
import { populateMemberships } from './userController';

export const getMembersInOrg = async (orgId: OrganizationId) => {
    const org = await getOrgById(orgId);
    if (org == null) {
        throw new Error('Org not found');
    }
    const records = await getOrganizationMembershipsForOrg(orgId);
    const members = populateMemberships(records);
    return members;
};

export const getOrgsForUser = async (userId: UserId) => {
    const records = await getOrganizationMembershipsForUser(userId);
    const orgIds = records.map((r) => r.orgId);
    const orgs = await Promise.all(orgIds.map(async (id) => await getOrgById(id)));
    return orgs.filter((o) => !!o);
};

export const getModulePermissionsForUser = async (userId: UserId, moduleId: UID) => {
    // Each module at least 2 perms, "Anyone on the internet", "Anyone in organization", ..."Specific users"
    // These can be one of "undefined" (inherit from parent), "view", "edit", "admin"
    // for a user, check:
    // 1. Does this user have a specific permission set on this module? If so, return that. If unset, continue.
    // 2. Is this user a member of the organization that owns this module? If so, return org-level permission. If unset, continue.
    // 3. If there is an "Anyone in organization" permission, return that. If unset, check the parent directory of this module and repeat.
    // If the top level module (the organization) is reached: If the user is a member of the org, return their org-level permission. If not, no access.
    const module = await getModuleByIdDb(moduleId);
    if (!module) {
        throw new Error(`Module ${moduleId} not found`);
    }
    const usersMembershipRecords = await getOrganizationMembershipsForUser(userId);
    const orgMembershipRecord = usersMembershipRecords.find((rec) => rec.orgId === module.orgId) || null;
    return await recursiveGetModulePermissionsForUser(userId, moduleId, orgMembershipRecord);
};

// const recursiveGetModulePermissionsForUser = async (userId: UserId, moduleId: UID, orgMembershipRecord: MembershipRecord | null): Promise<PermissionLevel | null> => {
//     const module = await getModuleByIdDb(moduleId);

//     if (module) {
//         // If the user has specific perms, return those
//         if (Object.keys(module.userPermissionLevels).includes(userId)) {
//             return module.userPermissionLevels[userId];
//         }

//         // If the user is a member of the org, return org-level perms
//         if (orgMembershipRecord && module.orgPermissionLevel !== null) {
//             return module.orgPermissionLevel;
//         }

//         // If the module has anyone level perms, return those
//         if (module.anyonePermissionLevel !== null) {
//             return module.anyonePermissionLevel;
//         }
//     } else {
//         const orgMaybe = await getOrgById(moduleId);
//         if (orgMaybe) {
//             // If the module is an organization, we've reached the top level
//             // Get the user's membership in the org and return that permission level
//             if (!orgMembershipRecord) {
//                 return null;
//             }
//             return orgMembershipRecord.permissionLevel;
//         }
//         throw new Error(`Module ${moduleId} not found`);
//     }

//     // If its not an org, get the parent module ID
//     const parentId = module.parentId;
//     if (!parentId) {
//         throw new Error(`Module ${moduleId} has no parent module to inherit permissions from`);
//     }

//     const parentPerms = await recursiveGetModulePermissionsForUser(userId, parentId, orgMembershipRecord);
//     return parentPerms;
// };

export const getUserDirectoryStructure = async (userId: UserId, orgId: OrganizationId): Promise<DirectoryList | undefined> => {
    const org = await getOrgById(orgId);
    if (!org) {
        console.error(`Org ${orgId} not found`);
        return undefined;
    }

    const fullDirectoryStructure = await recursivelyGetDirectoryModules(orgId);
    const trimmedDirectory = await trimOrgDirectoryStructureForUser(userId, fullDirectory);
    return trimmedDirectory;
};

/**
 * Get the full directory structure regardless of permissions using full modules
 */
interface ModuleWithChildren extends ModuleHeader {
    children?: ModuleWithChildren[];
}
const recursivelyGetDirectoryModules = async (parentId: UID): Promise<ModuleWithChildren[]> => {
    const modulesList: ModuleWithChildren[] = [];
    const modules = await getModulesByParentIdDb(parentId);
    for (const module of modules) {
        if (module.type === TrzModuleType.Directory) {
            const subItems = await recursivelyGetDirectoryModules(module.id);
            const dirModule: ModuleWithChildren = {
                ...module,
                children: subItems,
            };
            modulesList.push(dirModule);
        } else {
            modulesList.push(module);
        }
    }
    return modulesList;
};

/**
 * Trim an org directory structure to only include modules the user has access to
 */
const trimOrgDirectoryStructureForUser = async (userId: UserId, dirStructure: ModuleWithChildren[]): Promise<DirectoryList> => {};

// const buildDirectoryListItem = async (userId: UserId, module: TrzModule): Promise<DirectoryListItem | null> => {
//     const moduleId = module.id;
//     const permission = await getModulePermissionsForUser(userId, moduleId);

//     if (permission === null) {
//         return null;
//     }

//     // Recursively build directory structure
//     if (module.type === TrzModuleType.Directory) {
//         const subModules = await getModulesInDirectory(module.id);
//         const subItems: DirectoryListItem[] = [];

//         for (const subModule of subModules) {
//             const subItem = await buildDirectoryListItem(userId, subModule);
//             if (subItem) {
//                 subItems.push(subItem);
//             }
//         }

//         return {
//             moduleId: module.id,
//             moduleName: module.name,
//             moduleType: TrzModuleType.Directory,
//             subItems,
//         };
//     } else if (module.type === TrzModuleType.Document) {
//         return {
//             moduleId: module.id,
//             moduleName: module.name,
//             moduleType: TrzModuleType.Document,
//         };
//     } else if (module.type === TrzModuleType.Board) {
//         return {
//             moduleId: module.id,
//             moduleName: module.name,
//             moduleType: TrzModuleType.Board,
//         };
//     }

//     return null;
// };
