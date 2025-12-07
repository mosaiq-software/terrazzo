import { calculateTrueModulePermissionsInOrg, evaluatePermissionForRoles, PermissionFlag, UID, UserId } from '@mosaiq/terrazzo-common';
import { getModuleById } from '@trz-api/controllers/moduleController';
import { getAllRolePermissionsInOrg } from '@trz-api/controllers/roleController';
import { getRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { Socket } from 'socket.io';
import { getSocketData } from './socketUtils';

const getUserId = (user: UserId | Socket): UserId => {
    if (typeof user === 'string') {
        return user;
    } else {
        const socketData = getSocketData(user);
        return socketData.user.user.id;
    }
};

export const canViewModule = async (user: UserId | Socket, moduleId: UID): boolean => {
    const userId = getUserId(user);
    const module = await getModuleById(moduleId);
    if (!module) {
        return false;
    }
    const userRoles = await getRoleIdsForUserInOrgDb(userId, module.orgId);
    const orgRolePerms = await getAllRolePermissionsInOrg(module.orgId);
    const truePermissions = calculateTrueModulePermissionsInOrg(module.effectivePermissions, orgRolePerms);
    const grantedFlags = await evaluatePermissionForRoles(userRoles, truePermissions);
    const neededFlags = [PermissionFlag.VIEW_MODULE];
};
