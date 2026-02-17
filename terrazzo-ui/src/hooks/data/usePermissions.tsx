import { ModuleHeader, OrganizationId, PermissibleAction } from '@mosaiq/terrazzo-common';
import { usePermission } from '@trz/contexts/permission-context';
import { useEffect, useState } from 'react';

export const useOrgPermission = (orgId: OrganizationId | undefined, permissibleAction: PermissibleAction) => {
    const permCtx = usePermission();

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    useEffect(() => {
        permCtx.checkOrgPermission(permissibleAction).then((result) => {
            setHasPermission(result);
        });
    }, [permCtx, orgId, permissibleAction]);
    return !!hasPermission;
};

export const useModulePermission = (moduleHeader: ModuleHeader | undefined, permissibleAction: PermissibleAction) => {
    const permCtx = usePermission();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    useEffect(() => {
        if (!moduleHeader) {
            setHasPermission(false);
            return;
        }
        permCtx.checkModulePermission(permissibleAction, moduleHeader).then((result) => {
            setHasPermission(result);
        });
    }, [permCtx, moduleHeader, permissibleAction]);
    return !!hasPermission;
};
