import { EntityType, Role } from "@mosaiq/terrazzo-common/constants"
import { EntityId, Invite, InviteId, InviteRecord, OrganizationId, ProjectId, UserId } from "@mosaiq/terrazzo-common/types"
import { createInviteRecord, deleteInviteRecord, getAllInviteRecordsForEntity, getInviteRecordById, getInviteRecordsToUser } from "@trz-api/persistence/invitePersistence";
import { createMembershipRecord } from "@trz-api/persistence/membershipPersistence";
import {getUserById, getUserByUsername } from "@trz-api/persistence/userPersistence";

export const sendInvite = async (toUsername: string, fromUserId: UserId, entityId: ProjectId | OrganizationId, entityType: EntityType, role: Role): Promise<Invite> => {
    const toUser = await getUserByUsername(toUsername);
    if(!toUser){
        throw new Error("User not found");
    }

    const fromUser = await getUserById(fromUserId);
    if(!fromUser){
        throw new Error("Invalid sender");
    }

    const inviteRecord:InviteRecord = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        toUser: toUser.id,
        fromUser: fromUser.id,
        entityId,
        entityType,
        userRole: role
    };

    await createInviteRecord(inviteRecord);
    const invite:Invite = {
        ...inviteRecord,
        toUser: toUser,
        fromUser: fromUser,
    };
    return invite;
}

export const replyToInvite = async (inviteId:InviteId, accept:boolean) => {
    if(accept){
        await acceptInvite(inviteId);
    } else {
        await declineInvite(inviteId);
    }
}

const acceptInvite = async (inviteId: InviteId) => {
    const invite = await getInviteRecordById(inviteId);
    if(!invite){
        throw new Error("Invite not found");
    }
    await createMembershipRecord(invite.toUser, invite.entityId, invite.entityType, invite.userRole);
    await deleteInviteRecord(inviteId);
}

const declineInvite = async (inviteId: InviteId) => {
    await deleteInviteRecord(inviteId);
}

export const getInvitesForEntity = async (entityId: EntityId): Promise<Invite[]> => {
    const inviteRecords = await getAllInviteRecordsForEntity(entityId) ?? [];
    return await populateInviteRecords(inviteRecords);
}

export const getInvitesToUser = async (userId: UserId): Promise<Invite[]> => {
    const inviteRecords = await getInviteRecordsToUser(userId) ?? [];
    return await populateInviteRecords(inviteRecords);
}

const populateInviteRecords = async (inviteRecords:InviteRecord[]): Promise<Invite[]> => {
    const invites: Invite[] = [];
    for(const record of inviteRecords){
        const toUser = await getUserById(record.toUser);
        const fromUser = await getUserById(record.fromUser);
        if(toUser && fromUser){
            invites.push({
                ...record,
                toUser, fromUser
            });
        }
    }
    return invites;
}