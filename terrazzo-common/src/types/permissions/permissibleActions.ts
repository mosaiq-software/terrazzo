import { OrganizationId, UID } from '../genericTypes';
import { PermissionFlag } from './permissionFlags';

export enum PermissibleAction {
    AdministerOrg = 'AdministerOrg',
    EditRoles = 'EditRoles',
    AssignRoles = 'AssignRoles',
    ViewBoard = 'ViewBoard',
    EditBoard = 'EditBoard',
    CreateBoard = 'CreateBoard',
    MoveCards = 'MoveCards',
    EditCard = 'EditCard',
    ViewDocument = 'ViewDocument',
    EditDocument = 'EditDocument',
    CreateDocument = 'CreateDocument',
    ViewDirectory = 'ViewDirectory',
    EditDirectory = 'EditDirectory',
    CreateDirectory = 'CreateDirectory',
}

export type PermissionRequirementGroup = PermissionFlag[][];

export const PermissibleActionRequirements: Record<PermissibleAction, PermissionRequirementGroup> = {
    [PermissibleAction.AdministerOrg]: [[PermissionFlag.ADMINISTER_ORG]],
    [PermissibleAction.EditRoles]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_ROLES]],
    [PermissibleAction.AssignRoles]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_ROLES], [PermissionFlag.ASSIGN_ROLES]],
    [PermissibleAction.ViewBoard]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.VIEW_BOARD]],
    [PermissibleAction.EditBoard]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_BOARD]],
    [PermissibleAction.CreateBoard]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.CREATE_BOARD]],
    [PermissibleAction.MoveCards]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.MOVE_CARDS]],
    [PermissibleAction.EditCard]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_CARDS]],
    [PermissibleAction.ViewDocument]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.VIEW_DOCUMENT]],
    [PermissibleAction.EditDocument]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_DOCUMENT]],
    [PermissibleAction.CreateDocument]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.CREATE_DOCUMENT]],
    [PermissibleAction.ViewDirectory]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.VIEW_BOARD], [PermissionFlag.VIEW_DOCUMENT]],
    [PermissibleAction.EditDirectory]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_BOARD], [PermissionFlag.EDIT_DOCUMENT]],
    [PermissibleAction.CreateDirectory]: [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.CREATE_BOARD], [PermissionFlag.CREATE_DOCUMENT]],
};

export type FetchablePermissibleActionType = { action: PermissibleAction } & (
    | {
          type: 'org';
          orgId: OrganizationId;
      }
    | {
          type: 'module';
          moduleId: UID;
      }
);
