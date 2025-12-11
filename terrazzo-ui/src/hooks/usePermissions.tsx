import { OrganizationId, PermissibleAction, UID } from '@mosaiq/terrazzo-common';
import { usePermission } from '@trz/contexts/permission-context';
import { useEffect, useState } from 'react';

export const useOrgPermission = (orgId: OrganizationId | undefined, permissibleAction: PermissibleAction) => {
    const permCtx = usePermission();

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    useEffect(() => {
        if (!orgId) {
            setHasPermission(false);
            return;
        }
        permCtx.checkOrgPermission(permissibleAction, orgId).then((result) => {
            setHasPermission(result);
        });
    }, [permCtx, orgId, permissibleAction]);
    return !!hasPermission;
};

export const useModulePermission = (moduleId: UID | undefined, permissibleAction: PermissibleAction) => {
    const permCtx = usePermission();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    useEffect(() => {
        if (!moduleId) {
            setHasPermission(false);
            return;
        }
        permCtx.checkModulePermission(permissibleAction, moduleId).then((result) => {
            setHasPermission(result);
        });
    }, [permCtx, moduleId, permissibleAction]);
    return !!hasPermission;
};
