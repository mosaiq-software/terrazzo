import { InviteId, OrganizationId, UserId } from './genericTypes';

export interface Invite {
    id: InviteId;
    forOrganizationId: OrganizationId;
    maxUses: number | null;
    uses: number;
    createdById: UserId;
    createdAt: number;
    revokedAt: number | null;
}
