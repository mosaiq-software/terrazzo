import { OrganizationId, UserId } from './genericTypes';

export interface MembershipRecord {
    userId: UserId;
    orgId: OrganizationId;
    joinedAt: number;
}
