import { TEMPORARY_ID } from '../constants';
import { RoleId } from '../types/genericTypes';
import { TrzModuleType } from '../types/modules/moduleTypes';
import { PermissibleAction, PermissibleActionRequirements } from '../types/permissions/permissibleActions';
import { PermissionFlag } from '../types/permissions/permissionFlags';
import { ModulePermissions, OverridePermissions } from '../types/permissions/permissionTypes';
import { Role } from '../types/permissions/roleTypes';
import { recordKeys, recordValues } from './arrayUtils';

/**
 * Adds or removes a permission flag from an existing array of permission flags.
 * Prevents duplicates.
 */
export const withPermissionFlag = (existing: PermissionFlag[] | undefined, flag: PermissionFlag, enabled: boolean) => {
    const updated = new Set(existing ?? []);
    if (enabled) {
        updated.add(flag);
    } else {
        updated.delete(flag);
    }
    return Array.from(updated);
};

/**
 * Combines two OverridePermissions objects, with higherPrecedence taking precedence over lowerPrecedence.
 * If a permission flag is defined in higherPrecedence, it is used; otherwise, the value from lowerPrecedence is used.
 * If neither defines the flag, it remains undefined.
 * @param lowerPrecedence - The OverridePermissions with lower precedence.
 * @param higherPrecedence - The OverridePermissions with higher precedence.
 */
export const combinePermissions = (lowerPrecedence: OverridePermissions | undefined, higherPrecedence: OverridePermissions | undefined): OverridePermissions => {
    const effective: OverridePermissions = { ...(lowerPrecedence ?? {}), ...(higherPrecedence ?? {}) };
    return effective;
};

/**
 * Combines a list of OverridePermissions in order
 * @param permissionsList - The list of OverridePermissions to combine
 * @param order - "first-priority" means earlier items in the list take precedence, "last-priority" means later items take precedence
 */
export const combineOrderedPermissionsList = (permissionsList: OverridePermissions[], order: 'first-priority' | 'last-priority'): OverridePermissions => {
    if (permissionsList.length === 0) {
        return {};
    }
    const list = order === 'first-priority' ? permissionsList : [...permissionsList].reverse();
    let effective: OverridePermissions = list[0];
    for (let i = 1; i < list.length; i++) {
        const perms = list[i];
        effective = combinePermissions(effective, perms);
    }
    return effective;
};

/**
 * Calculates the effective permissions for all roles on a module based on its own desired permissions and its parent's desired permissions.
 * For each role, get the effective permissions by combining the parent's and child's desired permissions.
 * @param parentPermissions - The desired permissions for any role on the parent module.
 * @param childPermissions - The desired permissions for any role on the child module.
 * @returns The effective permissions for all roles on the child module.
 */
export const calculateModuleEffectivePermissions = (parentPermissions: ModulePermissions | undefined, childPermissions: ModulePermissions): ModulePermissions => {
    const effectivePermissions: ModulePermissions = {};
    const parentRoleIds = recordKeys(parentPermissions ?? {});
    const childRoleIds = recordKeys(childPermissions);
    const allRoleIds = new Set<RoleId>([...parentRoleIds, ...childRoleIds]);
    for (const roleId of allRoleIds) {
        effectivePermissions[roleId] = combinePermissions(parentPermissions?.[roleId], childPermissions?.[roleId]);
    }
    return effectivePermissions;
};

/**
 * Calculates the true permissions for all roles on a module within an organization.
 * If a role is not assigned in the effective permissions, it defaults to the organization's default permissions.
 * If a role is set in the effective permissions, its overrides are preferred, but any undefined flags are filled in from the organization's defaults.
 * @param moduleEffectivePermissions - The effective permissions for all roles on the module.
 * @param orgDefaultPermissions - The default permissions for each role in the organization.
 * @returns The true permissions for each role on the module within the organization.
 */
export const calculateTrueModulePermissionsInOrg = (moduleEffectivePermissions: ModulePermissions, orgRoles: Role[]): ModulePermissions => {
    const orgDefaultPermissions = mapRolesToPermissions(orgRoles);
    const truePermissions: ModulePermissions = {};
    const allRoleIds = recordKeys(orgDefaultPermissions);
    const allPermissionFlags = recordValues(PermissionFlag);
    for (const roleId of allRoleIds) {
        const orgDefault: OverridePermissions = {};
        for (const flag of allPermissionFlags) {
            orgDefault[flag] = orgDefaultPermissions[roleId].includes(flag);
        }
        const moduleOverrides = moduleEffectivePermissions[roleId];
        truePermissions[roleId] = combinePermissions(orgDefault, moduleOverrides);
    }
    return truePermissions;
};

/**
 * Given an OverridePermissions object, returns the list of PermissionFlags that are granted (set to true).
 * @param overrides - The OverridePermissions to evaluate.
 * @returns The list of PermissionFlags that are granted.
 */
export const getPermissionFlagsFromOverrides = (overrides: OverridePermissions): PermissionFlag[] => {
    const grantedFlags: PermissionFlag[] = [];
    const allFlags = recordValues(PermissionFlag);
    for (const flag of allFlags) {
        if (overrides[flag] === true) {
            grantedFlags.push(flag);
        }
    }
    return grantedFlags;
};

/**
 * Given a set of roles and a module's effective permissions, determines the list of permissions flags that are granted.
 * @param roles - The list of RoleIds to evaluate.
 * @param effectivePermissions - The ModulePermissions representing the effective permissions on the module.
 * @returns The list of PermissionFlags that are granted to the given roles.
 */
export const evaluatePermissionForRoles = (roles: RoleId[], effectivePermissions: ModulePermissions, isOwner?: boolean): PermissionFlag[] => {
    const grantedFlags = new Set<PermissionFlag>();
    for (const roleId of roles) {
        const roleOverrides = effectivePermissions[roleId];
        if (roleOverrides) {
            const flags = getPermissionFlagsFromOverrides(roleOverrides);
            for (const flag of flags) {
                grantedFlags.add(flag);
            }
        }
    }
    if (isOwner) {
        grantedFlags.add(PermissionFlag.ADMINISTER_ORG);
    }
    return Array.from(grantedFlags);
};

/**
 * Determines if the granted permission flags meet all the required permission flags.
 * @param grantedFlags - The list of PermissionFlags that are granted.
 * @param permissibleAction - An array of arrays of PermissionFlags, where at least one flag from each inner array must be present in grantedFlags.
 * Can be thought of as: [[A and B] or [C and D] or ...]
 * @returns True if any inner array of required flags is fully met by the granted flags, false otherwise.
 */
export const meetsRequirementsForPermissibleAction = (grantedFlags: PermissionFlag[], permissibleAction: PermissibleAction): boolean => {
    const requirementsGroup = PermissibleActionRequirements[permissibleAction];
    for (const requiredFlagGroup of requirementsGroup) {
        const groupMet = requiredFlagGroup.every((flag) => grantedFlags.includes(flag));
        if (groupMet) {
            return true;
        }
    }
    return false;
};

/**
 * Evaluates the organization-level permissions for a user based on their roles and the organization's default permissions.
 * @param roleIds - The list of RoleIds assigned to the user within the organization.
 * @param orgDefaultPermissions - The default permissions for each role in the organization.
 * @returns The list of PermissionFlags that are granted to the given roles.
 */
export const evaluateOrganizationPermissionForRoles = (roleIds: RoleId[], orgRoles: Role[], isOwner?: boolean): PermissionFlag[] => {
    const orgDefaultPermissions = mapRolesToPermissions(orgRoles);
    const grantedFlags = new Set<PermissionFlag>();
    for (const roleId of roleIds) {
        const roleDefaults = orgDefaultPermissions[roleId];
        if (roleDefaults) {
            for (const flag of roleDefaults) {
                grantedFlags.add(flag);
            }
        }
    }
    if (isOwner) {
        grantedFlags.add(PermissionFlag.ADMINISTER_ORG);
    }
    return Array.from(grantedFlags);
};

/**
 * Maps a list of roles to their default permission flags.
 */
const mapRolesToPermissions = (roles: Role[]): Record<RoleId, PermissionFlag[]> => {
    const rolePermissions: Record<RoleId, PermissionFlag[]> = {};
    for (const role of roles) {
        rolePermissions[role.id] = role.defaultPermissions;
    }
    return rolePermissions;
};

/**
 * Returns the permissible actions for a given module type.
 * (Used for handling module-level permissions in a generic way.)
 */
export const modulePermissibleAction = (moduleType: TrzModuleType) => {
    switch (moduleType) {
        case TrzModuleType.Directory:
            return {
                view: PermissibleAction.ViewDirectory,
                edit: PermissibleAction.EditDirectory,
                create: PermissibleAction.CreateDirectory,
            };
        case TrzModuleType.Board:
            return {
                view: PermissibleAction.ViewBoard,
                edit: PermissibleAction.EditBoard,
                create: PermissibleAction.CreateBoard,
            };
        case TrzModuleType.Document:
            return {
                view: PermissibleAction.ViewDocument,
                edit: PermissibleAction.EditDocument,
                create: PermissibleAction.CreateDocument,
            };
        default:
            throw new Error(`[modulePermissibleAction] Unsupported module type: ${moduleType}`);
    }
};

/**
 * Returns the highest-priority role from a list of roles (the one with the lowest order value).
 */
export const getMaxUserRole = (userRoles: Role[], userIsOwner?: boolean): Role | undefined => {
    if (userIsOwner) {
        const superAdminRole: Role = {
            id: TEMPORARY_ID,
            orgId: TEMPORARY_ID,
            name: 'SUPER ADMIN',
            color: '#000000',
            order: -1,
            defaultPermissions: recordValues(PermissionFlag),
        };
        return superAdminRole;
    }
    const sorted = userRoles.sort((ra, rb) => ra.order - rb.order);
    return sorted?.[0];
};
