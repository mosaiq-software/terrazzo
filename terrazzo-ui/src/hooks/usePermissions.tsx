import { PermissionLevel, PermissionRecord, UID } from '@mosaiq/terrazzo-common/types';
import { useDirectoryContext } from '@trz/contexts/user-directory-context';

const DEFAULT_PERMISSION_RECORD: PermissionRecord = {
    anyonePermissionLevel: PermissionLevel.NONE,
    orgPermissionLevel: PermissionLevel.NONE,
    userPermissionLevels: {},
};

export const usePermissions = (moduleId: UID) => {
    const dirCtx = useDirectoryContext();
    const permissionRecord = dirCtx.permissionRecords[moduleId] || DEFAULT_PERMISSION_RECORD;

    return permissionRecord;
};
