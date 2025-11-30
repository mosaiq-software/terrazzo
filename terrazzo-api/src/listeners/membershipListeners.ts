import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { OrganizationId, UserId } from '@mosaiq/terrazzo-common/types';
import { getRoomCode, RoomSpecifier } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { getMembersInOrg, getOrgsForUser, removeMembership, updateMembership } from '@trz-api/controllers/membershipController';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerMembershipListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_ORGANIZATION_MEMBERSHIPS, async (data: ClientSEPayload[ClientSE.GET_ORGANIZATION_MEMBERSHIPS], reply: ClientSEReply<ClientSE.GET_ORGANIZATION_MEMBERSHIPS>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const memberships = await getMembersInOrg(data);
            reply(memberships);
        } catch (error: any) {
            console.error('Error getting organization memberships', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_MEMBERSHIP, async (data: ClientSEPayload[ClientSE.UPDATE_MEMBERSHIP], reply: ClientSEReply<ClientSE.UPDATE_MEMBERSHIP>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            await updateMembership(data.userId, data.orgId, data.newPermissionLevel);
            await syncMembersInOrg(socket, data.orgId);
            await syncUsersOrgs(socket, data.userId);
            reply(undefined);
        } catch (error: any) {
            console.error('Error updating membership', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.DELETE_MEMBERSHIP, async (data: ClientSEPayload[ClientSE.DELETE_MEMBERSHIP], reply: ClientSEReply<ClientSE.DELETE_MEMBERSHIP>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            await removeMembership(data.userId, data.orgId);
            await syncMembersInOrg(socket, data.orgId);
            await syncUsersOrgs(socket, data.userId);
            reply(undefined);
        } catch (error: any) {
            console.error('Error deleting membership', error);
            reply(undefined, error.message);
        }
    });
};

const syncMembersInOrg = async (socket: Socket, orgId: OrganizationId) => {
    try {
        const allMembers = await getMembersInOrg(orgId);
        broadcast(socket, ServerSE.UPDATE_ORGANIZATION_MEMBERSHIPS, { members: allMembers, orgId: orgId }, [getRoomCode(RoomType.DATA, orgId, RoomSpecifier.MEMBERSHIP)]);
    } catch (error: any) {
        console.error('Error syncing organization memberships', error);
    }
};

const syncUsersOrgs = async (socket: Socket, userId: UserId) => {
    try {
        const usersOrgs = await getOrgsForUser(userId);
        broadcast(socket, ServerSE.UPDATE_USERS_ORGANIZATIONS, { userId: userId, organizations: usersOrgs }, [getRoomCode(RoomType.USER, userId)]);
    } catch (error: any) {
        console.error('Error syncing users organizations', error);
    }
};
