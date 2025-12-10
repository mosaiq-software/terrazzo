import { PermissibleAction, UID } from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { useUser } from '@trz/contexts/user-context';

export const usePermissions = (moduleId: UID, permissibleAction: PermissibleAction) => {
    const userCtx = useUser();
    const orgCtx = useOrg();
    if (!userCtx.userData?.id) {
        console.warn('Permission denied: no user id found');
        return false;
    }
};
