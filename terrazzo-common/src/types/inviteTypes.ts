import { InviteId, OrganizationId, UserId } from './genericTypes';

export interface CreateInvite {
    forOrganizationId: OrganizationId;
    maxUses: number | null;
    createdById: UserId;
}

export interface UpdateInvite {
    maxUses?: number | null;
    revokedAt?: number | null;
}

export interface Invite {
    id: InviteId;
    forOrganizationId: OrganizationId;
    maxUses: number | null;
    uses: number;
    createdById: UserId;
    createdAt: number;
    revokedAt: number | null;
}
