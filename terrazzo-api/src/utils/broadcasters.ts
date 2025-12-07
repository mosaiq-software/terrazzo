import { DirectoryId, getRoomCode, InviteId, OrganizationId, RoomSpecifier, RoomType, ServerSE, UID, UserId } from '@mosaiq/terrazzo-common';
import { getDirectoryContents } from '@trz-api/controllers/directoryController';
import { getAllInvitesForOrg } from '@trz-api/controllers/inviteController';
import { getMembersInOrg, getOrgsForUser } from '@trz-api/controllers/membershipController';
import { getModuleById } from '@trz-api/controllers/moduleController';
import { getInviteRecordById } from '@trz-api/persistence/invitePersistence';
import { getRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { Socket } from 'socket.io';
import { broadcast } from './socketUtils';

export const syncOrgInvitesFromInviteId = async (socket: Socket, inviteId: InviteId) => {
    try {
        const inviteRecord = await getInviteRecordById(inviteId);
        if (!inviteRecord) {
            throw new Error('Invite not found for syncing org invites');
        }
        await syncOrgInvites(socket, inviteRecord.forOrganizationId);
    } catch (error: any) {
        console.error('Error syncing org invites from invite id', error);
    }
};

/**
 * Syncs the invites for an organization by broadcasting the updated list to all members in the org's invite room.
 */
export const syncOrgInvites = async (socket: Socket, orgId: OrganizationId) => {
    try {
        const invites = await getAllInvitesForOrg(orgId);
        broadcast(socket, ServerSE.UPDATE_ORGANIZATION_INVITES, { invites: invites, orgId: orgId }, [getRoomCode(RoomType.DATA, orgId, RoomSpecifier.INVITES)]);
    } catch (error: any) {
        console.error('Error syncing org invites', error);
    }
};

/**
 * Syncs the members in an organization by broadcasting the updated list to all members in the org's membership room.
 */
export const syncMembersInOrg = async (socket: Socket, orgId: OrganizationId) => {
    try {
        const allMembers = await getMembersInOrg(orgId);
        broadcast(socket, ServerSE.UPDATE_ORGANIZATION_MEMBERSHIPS, { members: allMembers, orgId: orgId }, [getRoomCode(RoomType.DATA, orgId, RoomSpecifier.MEMBERSHIP)]);
    } catch (error: any) {
        console.error('Error syncing organization memberships', error);
    }
};

/**
 * Syncs the organizations for a user by broadcasting the updated list to the user's personal room.
 */
export const syncUsersOrgs = async (socket: Socket, userId: UserId) => {
    try {
        const usersOrgs = await getOrgsForUser(userId);
        broadcast(socket, ServerSE.UPDATE_USERS_ORGANIZATIONS, { userId: userId, organizations: usersOrgs }, [getRoomCode(RoomType.USER, userId)]);
    } catch (error: any) {
        console.error('Error syncing users organizations', error);
    }
};

export const syncRolesForUserInOrg = async (socket: Socket, userId: UserId, orgId: OrganizationId) => {
    try {
        const roleIds = await getRoleIdsForUserInOrgDb(userId, orgId);
        const roomKey = `${orgId}_${userId}`;
        broadcast(socket, ServerSE.UPDATE_ROLES_FOR_USER_IN_ORG, { userId, orgId, roleIds }, [getRoomCode(RoomType.DATA, roomKey, RoomSpecifier.ROLE_ASSIGNMENTS)]);
    } catch (error: any) {
        console.error('Error syncing roles for user in organization', error);
    }
};

export const syncParentsDirectoryContents = async (socket: Socket, childId: UID) => {
    try {
        const childModule = await getModuleById(childId);
        if (!childModule) {
            throw new Error('Child module not found for syncing parent directory contents');
        }
        const parentId = childModule.parentId;
        if (!parentId) {
            throw new Error('No parentId found for child module when syncing parent directory contents');
        }
        await syncDirectoryContents(socket, parentId);
    } catch (error: any) {
        console.error('Error syncing parents directory contents', error);
    }
};
export const syncDirectoryContents = async (socket: Socket, dirId: DirectoryId) => {
    try {
        const directoryContents = await getDirectoryContents(dirId);
        broadcast(socket, ServerSE.UPDATE_DIRECTORY_CONTENTS, { directoryId: dirId, contents: directoryContents }, [getRoomCode(RoomType.DATA, dirId, RoomSpecifier.CONTENTS)]);
    } catch (error: any) {
        console.error('Error syncing directory contents', error);
    }
};
