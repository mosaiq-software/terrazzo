import { OrganizationId, RoleId } from '../genericTypes';
import { PermissionFlag } from './permissionFlags';

export interface CreateRole {
    orgId: OrganizationId;
    name: string;
    color: string;
    order: number;
}

export interface UpdateRole {
    name?: string;
    color?: string;
}

export interface Role {
    id: RoleId;
    orgId: OrganizationId;
    name: string;
    color: string;
    order: number;
    defaultPermissions: PermissionFlag[];
}
