import { calculateTrueModulePermissionsInOrg, evaluateOrganizationPermissionForRoles, evaluatePermissionForRoles, getMaxUserRole, meetsRequirementsForPermissibleAction, ModuleHeader, PermissibleAction, Role, RoleId } from '@mosaiq/terrazzo-common';
import { useRoleForUserInOrg } from '@trz/hooks/useRolesForUserInOrg';
import React, { createContext, useContext } from 'react';
import { useOrg } from './org-context';
import { useUser } from './user-context';

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
    const userCtx = useUser();
    const { roleIds: userRoleIds, roles: userRoles } = useRoleForUserInOrg(userCtx.userData?.id, orgCtx.active?.id);
    const userIsActiveOrgOwner = !!(userCtx.userData?.id && orgCtx.active && userCtx.userData.id === orgCtx.active.ownerId);

    const checkOrgPermission = async (permissibleAction: PermissibleAction): Promise<boolean> => {
        if (!userCtx.userData?.id || !orgCtx.active) {
            return false;
        }
        const grantedFlags = evaluateOrganizationPermissionForRoles(userRoleIds, orgCtx.roles, userIsActiveOrgOwner);
        return meetsRequirementsForPermissibleAction(grantedFlags, permissibleAction);
    };

    const checkModulePermission = async (permissibleAction: PermissibleAction, moduleHeader: ModuleHeader): Promise<boolean> => {
        if (!userCtx.userData?.id || !orgCtx.active?.id) {
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
                maxRole: getMaxUserRole(userRoles, userIsActiveOrgOwner),
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
