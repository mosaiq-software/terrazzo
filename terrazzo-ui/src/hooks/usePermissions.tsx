import { OrganizationId, PermissibleAction, UID } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getModuleActionPermission, getOrgActionPermission } from '@trz/emitters/permissionEmitters';
import { useEffect, useState } from 'react';

export const useOrgPermission = (orgId: OrganizationId, permissibleAction: PermissibleAction) => {
    const sockCtx = useSocket();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchPermission = async () => {
            const result = await getOrgActionPermission(sockCtx, permissibleAction, orgId);
            setHasPermission(!!result);
        };
        fetchPermission();
    }, [sockCtx, orgId, permissibleAction]);

    return !!hasPermission;
};

export const useModulePermission = (moduleId: UID, permissibleAction: PermissibleAction) => {
    const sockCtx = useSocket();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    useEffect(() => {
        const fetchPermission = async () => {
            const result = await getModuleActionPermission(sockCtx, permissibleAction, moduleId);
            setHasPermission(!!result);
        };
        fetchPermission();
    }, [sockCtx, moduleId, permissibleAction]);

    return !!hasPermission;
};
