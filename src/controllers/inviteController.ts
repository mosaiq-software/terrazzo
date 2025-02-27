import { EntityType, Role } from "@mosaiq/terrazzo-common/constants"
import { Invite, InviteId, OrganizationId, ProjectId, UserId } from "@mosaiq/terrazzo-common/types"
import { createInvite, deleteInvite, getInviteById } from "@trz-api/persistence/invitePersistence";
import { createMembershipRecord } from "@trz-api/persistence/membershipPersistence";
import {getUserByUsername } from "@trz-api/persistence/userPersistence";

export const sendInvite = async (toUsername: string, fromUser: UserId, entityId: ProjectId | OrganizationId, entityType: EntityType, role: Role): Promise<Invite> => {
    const toUser = await getUserByUsername(toUsername);
    if(!toUser){
        throw new Error("User not found");
    }
    const invite:Invite = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        toUser: toUser.id,
        fromUser,
        entityId,
        entityType,
        role
    };
    await createInvite(invite);
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
    const invite = await getInviteById(inviteId);
    if(!invite){
        throw new Error("Invite not found");
    }
    await createMembershipRecord(invite.toUser, invite.entityId, invite.entityType, invite.role);
    await deleteInvite(inviteId);
}

const declineInvite = async (inviteId: InviteId) => {
    await deleteInvite(inviteId);
}