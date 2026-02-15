import { ModuleId, OrganizationId } from '../genericTypes';
import { PermissionFlag } from './permissionFlags';

export enum PermissibleAction {
    AdministerOrg = 'AdministerOrg',
    EditRoles = 'EditRoles',
    AssignRoles = 'AssignRoles',
    ViewModules = 'ViewModules',
    ManageModules = 'ManageModules',
    ManageCards = 'ManageCards',
}

export type PermissionRequirementGroup = PermissionFlag[][];

export const PermissibleActionRequirements: Record<PermissibleAction, PermissionRequirementGroup> = {
    [PermissibleAction.AdministerOrg]: [[PermissionFlag.ADMINISTER_ORG]],
    [PermissibleAction.EditRoles]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_ROLES]],
    [PermissibleAction.AssignRoles]: [
        [PermissionFlag.ADMINISTER_ORG],
        [PermissionFlag.EDIT_ROLES],
        [PermissionFlag.ASSIGN_ROLES],
    ],
    [PermissibleAction.ViewModules]: [
        [PermissionFlag.ADMINISTER_ORG],
        [PermissionFlag.MANAGE_MODULES],
        [PermissionFlag.VIEW_MODULES],
    ],
    [PermissibleAction.ManageModules]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.MANAGE_MODULES]],
    [PermissibleAction.ManageCards]: [
        [PermissionFlag.ADMINISTER_ORG],
        [PermissionFlag.MANAGE_MODULES],
        [PermissionFlag.MANAGE_CARDS],
    ],
};

export type FetchablePermissibleActionType = { action: PermissibleAction } & (
    | {
          type: 'org';
          orgId: OrganizationId;
      }
    | {
          type: 'module';
          moduleId: ModuleId;
      }
);
