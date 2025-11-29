import { PermissionLevel, PermissionRecord, UID } from '@mosaiq/terrazzo-common/types';
import { useTRZ } from '@trz/contexts/TRZ-context';

const DEFAULT_PERMISSION_RECORD: PermissionRecord = {
    anyonePermissionLevel: PermissionLevel.NONE,
    orgPermissionLevel: PermissionLevel.NONE,
    userPermissionLevels: {},
};

export const usePermissions = (moduleId: UID) => {
    const trz = useTRZ();
    const permissionRecord = trz.permissionRecords[moduleId] || DEFAULT_PERMISSION_RECORD;

    return permissionRecord;
};
