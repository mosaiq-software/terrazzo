import { calculateTrueModulePermissionsInOrg, evaluateOrganizationPermissionForRoles, evaluatePermissionForRoles, getMaxUserRole, meetsRequirementsForPermissibleAction, ModuleHeader, PermissibleAction, Role, RoleId } from '@mosaiq/terrazzo-common';
import { useRoleForUserInOrg } from '@trz/hooks/useRolesForUserInOrg';
import React, { createContext, useContext } from 'react';
import { useOrg } from './org-context';
import { useUserContext } from './user-context';

export type PermissionContextType = {
    checkOrgPermission: (action: PermissibleAction) => Promise<boolean>;
    checkModulePermission: (action: PermissibleAction, moduleHeader: ModuleHeader) => Promise<boolean>;
    userRoleIds: RoleId[];
    userRoles: Role[];
    maxRole: Role | undefined;
    userIsActiveOrgOwner: boolean;
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

const PermissionProvider: React.FC<any> = ({ children }) => {
    const orgCtx = useOrg();
    const userCtx = useUserContext();
    const { roleIds: userRoleIds, roles: userRoles } = useRoleForUserInOrg(userCtx.userId, orgCtx.active?.id);
    const userIsActiveOrgOwner = !!(userCtx.userId && orgCtx.active && userCtx.userId === orgCtx.active.ownerId);

    const checkOrgPermission = async (permissibleAction: PermissibleAction): Promise<boolean> => {
        if (!userCtx.userId || !orgCtx.active) {
            return false;
        }
        const grantedFlags = evaluateOrganizationPermissionForRoles(userRoleIds, orgCtx.roles, userIsActiveOrgOwner);
        return meetsRequirementsForPermissibleAction(grantedFlags, permissibleAction);
    };

    const checkModulePermission = async (permissibleAction: PermissibleAction, moduleHeader: ModuleHeader): Promise<boolean> => {
        if (!userCtx.userId || !orgCtx.active?.id) {
            return false;
        }
        const truePermissions = calculateTrueModulePermissionsInOrg(moduleHeader.effectivePermissions, orgCtx.roles);
        const grantedFlags = evaluatePermissionForRoles(userRoleIds, truePermissions, userIsActiveOrgOwner);
        return meetsRequirementsForPermissibleAction(grantedFlags, permissibleAction);
    };

    return (
        <PermissionContext.Provider
            value={{
                checkOrgPermission,
                checkModulePermission,
                userRoleIds,
                userRoles,
                maxRole: getMaxUserRole(userRoles),
                userIsActiveOrgOwner,
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};

const usePermissionContext = () => {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
};

export { PermissionProvider, usePermissionContext as usePermission };
