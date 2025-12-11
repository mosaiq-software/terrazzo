import { OrganizationId, PermissibleAction, UID } from '@mosaiq/terrazzo-common';
import { getModuleActionPermission, getOrgActionPermission } from '@trz/emitters/permissionEmitters';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useOrg } from './org-context';
import { useSocket } from './socket-context';

export type PermissionContextType = {
    checkOrgPermission: (action: PermissibleAction, orgId: OrganizationId) => Promise<boolean>;
    checkModulePermission: (action: PermissibleAction, moduleId: UID) => Promise<boolean>;
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

const PERMISSION_CHECK_THROTTLE = 1000 * 10;

const PermissionProvider: React.FC<any> = ({ children }) => {
    const sockCtx = useSocket();
    const orgCtx = useOrg();

    const [permissionMap, setPermissionMap] = useState<Map<PermissibleAction, { granted: boolean; lastChecked: number }>>(new Map());

    // Clear permission cache when org changes
    useEffect(() => {
        setPermissionMap(new Map());
    }, [orgCtx.active?.id]);

    const checkOrgPermission = async (action: PermissibleAction, orgId: OrganizationId): Promise<boolean> => {
        const now = Date.now();
        const existing = permissionMap.get(action);
        if (existing && now - existing.lastChecked < PERMISSION_CHECK_THROTTLE) {
            return existing.granted;
        }
        const fetched = await getOrgActionPermission(sockCtx, action, orgId);
        if (fetched === undefined) {
            console.warn('Failed to fetch permission for action', action, 'in org', orgId);
            return false;
        }
        permissionMap.set(action, { granted: fetched, lastChecked: now });
        return fetched;
    };

    const checkModulePermission = async (action: PermissibleAction, moduleId: UID): Promise<boolean> => {
        const now = Date.now();
        const existing = permissionMap.get(action);
        if (existing && now - existing.lastChecked < PERMISSION_CHECK_THROTTLE) {
            return existing.granted;
        }
        const fetched = await getModuleActionPermission(sockCtx, action, moduleId);
        if (fetched === undefined) {
            console.warn('Failed to fetch permission for action', action, 'on module', moduleId);
            return false;
        }
        permissionMap.set(action, { granted: fetched, lastChecked: now });
        return fetched;
    };

    return (
        <PermissionContext.Provider
            value={{
                checkOrgPermission,
                checkModulePermission,
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};

const usePermission = () => {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
};

export { PermissionProvider, usePermission };
