import { OrganizationId, URL, UserId } from './genericTypes';
import { UserHeader } from './userTypes';

export interface OrganizationHeader {
    id: OrganizationId;
    name: string;
    createdAt: number;
    logoUrl: URL;
    description: string;
}

export interface MembershipRecord {
    userId: UserId;
    orgId: OrganizationId;
    joinedAt: number;
}

export interface Member extends MembershipRecord {
    user: UserHeader;
}
