import { OrganizationId, URL, UserId } from './genericTypes';

export interface OrganizationHeader {
    id: OrganizationId;
    name: string;
    createdAt: number;
    logoUrl: URL;
    description: string;
    ownerId: UserId;
}

export interface MembershipRecord {
    userId: UserId;
    orgId: OrganizationId;
    joinedAt: number;
}
