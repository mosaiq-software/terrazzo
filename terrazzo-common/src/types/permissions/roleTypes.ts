import { OrganizationId, RoleId } from '../genericTypes';
import { PermissionFlag } from './permissionFlags';

export interface Role {
    id: RoleId;
    orgId: OrganizationId;
    name: string;
    color: string;
    order: number;
    defaultPermissions: PermissionFlag[];
}
