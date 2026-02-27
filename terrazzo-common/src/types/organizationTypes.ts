import { OrganizationId, URL, UserId } from './genericTypes';

export interface CreateOrganizationHeader {
    name: string;
    ownerId: UserId;
    logoUrl?: URL;
    description?: string;
}

export interface UpdateOrganizationHeader {
    name?: string;
    logoUrl?: URL;
    description?: string;
    ownerId?: UserId;
}

export interface OrganizationHeader {
    id: OrganizationId;
    name: string;
    createdAt: number;
    logoUrl: URL;
    description: string;
    ownerId: UserId;
}
