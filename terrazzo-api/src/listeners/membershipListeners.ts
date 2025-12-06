import { ClientSE, ClientSEPayload, ClientSEReply } from '@mosaiq/terrazzo-common';
import { getMembersInOrg, removeMembership } from '@trz-api/controllers/membershipController';
import { syncMembersInOrg, syncUsersOrgs } from '@trz-api/utils/broadcasters';
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
