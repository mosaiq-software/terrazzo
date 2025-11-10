import { Role } from '@mosaiq/terrazzo-common/constants';
import { Invite, InviteId, InviteRecord, OrganizationId, UserId } from '@mosaiq/terrazzo-common/types';
import { createInviteRecord, deleteInviteRecord, getAllInviteRecordsForEntity, getInviteRecordById, getInviteRecordsToUser, getInviteRecordsToUserInEntity } from '@trz-api/persistence/invitePersistence';
import { createMembershipRecord, getMembershipRecordsForUserInEntity } from '@trz-api/persistence/membershipPersistence';
import { getUserById, getUserByUsername } from '@trz-api/persistence/userPersistence';
import { getOrganizationPreview } from './organizationController';

export const sendInvite = async (toUsername: string, fromUserId: UserId, entityId: OrganizationId, role: Role): Promise<Invite> => {
    const toUser = await getUserByUsername(toUsername);
    if (!toUser) {
        throw new Error('User not found');
    }

    const fromUser = await getUserById(fromUserId);
    if (!fromUser) {
        throw new Error('Invalid sender');
    }

    const existingRecords = await getInviteRecordsToUserInEntity(toUser.id, entityId);
    if (existingRecords?.length) {
        throw new Error('User already invited');
    }

    const existingMembership = await getMembershipRecordsForUserInEntity(toUser.id, entityId);
    if (existingMembership?.length) {
        throw new Error('User already a member');
    }

    const inviteRecord: InviteRecord = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        toUser: toUser.id,
        fromUser: fromUser.id,
        entityId,
        userRole: role,
    };
    await createInviteRecord(inviteRecord);

    const invite = (await populateInviteRecords([inviteRecord]))[0];
    return invite;
};

export const replyToInvite = async (inviteId: InviteId, accept: boolean): Promise<InviteRecord | undefined> => {
    if (accept) {
        return await acceptInvite(inviteId);
    } else {
        return await declineInvite(inviteId);
    }
};

const acceptInvite = async (inviteId: InviteId): Promise<InviteRecord | undefined> => {
    const invite = await getInviteRecordById(inviteId);
    if (!invite) {
        throw new Error('Invite not found');
    }
    await createMembershipRecord(invite.toUser, invite.entityId, invite.userRole);
    await deleteInviteRecord(inviteId);
    return invite;
};

const declineInvite = async (inviteId: InviteId): Promise<InviteRecord | undefined> => {
    const invite = await getInviteRecordById(inviteId);
    if (!invite) {
        throw new Error('Invite not found');
    }
    await deleteInviteRecord(inviteId);
    return invite;
};

export const getInvitesForEntity = async (entityId: OrganizationId): Promise<Invite[]> => {
    const inviteRecords = (await getAllInviteRecordsForEntity(entityId)) ?? [];
    return await populateInviteRecords(inviteRecords);
};

export const getInvitesToUser = async (userId: UserId): Promise<Invite[]> => {
    const inviteRecords = (await getInviteRecordsToUser(userId)) ?? [];
    return await populateInviteRecords(inviteRecords);
};

const populateInviteRecords = async (inviteRecords: InviteRecord[]): Promise<Invite[]> => {
    const invites: Invite[] = [];
    for (const record of inviteRecords) {
        const toUser = await getUserById(record.toUser);
        const fromUser = await getUserById(record.fromUser);
        const entity = await getOrganizationPreview(record.entityId);
        if (toUser && fromUser && entity) {
            invites.push({
                ...record,
                toUser,
                fromUser,
                entity,
            });
        }
    }
    return invites;
};
