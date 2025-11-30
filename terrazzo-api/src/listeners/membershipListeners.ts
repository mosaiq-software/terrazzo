import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { getAllInvitesForOrg } from '@trz-api/controllers/inviteController';
import { getOrgsForUser, removeMembership, updateMembership } from '@trz-api/controllers/membershipController';
import { getFullOrganization } from '@trz-api/controllers/organizationController';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerMembershipListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_INVITES_FOR_ORG, async (data: ClientSEPayload[ClientSE.GET_INVITES_FOR_ORG], reply: ClientSEReply<ClientSE.GET_INVITES_FOR_ORG>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const invites = await getAllInvitesForOrg(data);
            reply(invites);
        } catch (error: any) {
            console.error('Error getting invites for organization', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_MEMBERSHIP, async (data: ClientSEPayload[ClientSE.UPDATE_MEMBERSHIP], reply: ClientSEReply<ClientSE.UPDATE_MEMBERSHIP>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            await updateMembership(data.userId, data.orgId, data.newPermissionLevel);
            const organization = await getFullOrganization(data.orgId);
            if (!organization) {
                throw new Error('Failed to fetch updated organization data');
            }
            broadcast(socket, ServerSE.UPDATE_ORG_FIELD, organization, [getRoomCode(RoomType.DATA, data.orgId)]);
            const usersOrgs = await getOrgsForUser(data.userId);
            broadcast(socket, ServerSE.UPDATE_USERS_ORGANIZATIONS, { userId: data.userId, organizations: usersOrgs }, [getRoomCode(RoomType.USER, data.userId)]);
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
            const organization = await getFullOrganization(data.orgId);
            if (!organization) {
                throw new Error('Failed to fetch updated organization data');
            }
            broadcast(socket, ServerSE.UPDATE_ORG_FIELD, organization, [getRoomCode(RoomType.DATA, data.orgId)]);
            const usersOrgs = await getOrgsForUser(data.userId);
            broadcast(socket, ServerSE.UPDATE_USERS_ORGANIZATIONS, { userId: data.userId, organizations: usersOrgs }, [getRoomCode(RoomType.USER, data.userId)]);
            reply(undefined);
        } catch (error: any) {
            console.error('Error deleting membership', error);
            reply(undefined, error.message);
        }
    });
};
