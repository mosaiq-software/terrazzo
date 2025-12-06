import { OrganizationId, URL, UserId } from './genericTypes';
import { UserHeader } from './userTypes';

export interface OrganizationHeader {
    id: OrganizationId;
    name: string;
    createdAt: number;
    logoUrl: URL;
    description: string;
}

export enum OrgMembershipLevel {
    MEMBER,
    ADMIN,
}

export interface MembershipRecord {
    userId: UserId;
    orgId: OrganizationId;
    permissionLevel: OrgMembershipLevel;
}

export interface Member {
    user: UserHeader;
    record: MembershipRecord;
}
