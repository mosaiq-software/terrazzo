import { ClientSE, OrganizationId, PermissibleAction, UID } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getModuleActionPermission = async (sockCtx: SocketContextType, action: PermissibleAction, moduleId: UID) => {
    return await sockCtx.emit(ClientSE.GET_CAN_PERFORM_PERMISSIBLE_ACTION, { action, type: 'module', moduleId });
};

export const getOrgActionPermission = async (sockCtx: SocketContextType, action: PermissibleAction, orgId: OrganizationId) => {
    return await sockCtx.emit(ClientSE.GET_CAN_PERFORM_PERMISSIBLE_ACTION, { action, type: 'org', orgId });
};
