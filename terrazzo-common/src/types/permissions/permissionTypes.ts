import { RoleId } from '../genericTypes';
import { PermissionFlag } from './permissionFlags';

export type OverridePermissions = Partial<Record<PermissionFlag, boolean>>;
export type ModulePermissions = Record<RoleId, OverridePermissions>;
