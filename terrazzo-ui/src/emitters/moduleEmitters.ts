import {
    ClientSE,
    CreateModuleDataArgs,
    isModuleType,
    ModuleHeader,
    ModuleId,
    TrzModule,
    UpdateModuleDataArgs,
} from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getModule = async <T extends TrzModule>(
    sockCtx: SocketContextType,
    moduleId: ModuleId,
    expectedType: T
): Promise<ModuleHeader<T> | undefined> => {
    const untypedModule = await getUntypedModule(sockCtx, moduleId);
    if (!untypedModule) {
        return undefined;
    }
    if (!isModuleType(untypedModule, expectedType)) {
        return undefined;
    }
    return untypedModule;
};

export const getUntypedModule = async (
    sockCtx: SocketContextType,
    moduleId: ModuleId
): Promise<ModuleHeader | undefined> => {
    const module = await sockCtx.emit(ClientSE.GET_MODULE, moduleId);
    return module;
};

export const createModule = async (
    sockCtx: SocketContextType,
    name: string,
    parentId: ModuleId,
    args: CreateModuleDataArgs
): Promise<ModuleId | undefined> => {
    return await sockCtx.emit(ClientSE.CREATE_MODULE, { name, parentId, args });
};

export const updateModuleField = async (sockCtx: SocketContextType, id: ModuleId, args: UpdateModuleDataArgs) => {
    await sockCtx.emit(ClientSE.UPDATE_MODULE_FIELD, { moduleId: id, args });
};

export const getModuleChildren = async (sockCtx: SocketContextType, moduleId: ModuleId): Promise<ModuleId[]> => {
    const children = await sockCtx.emit(ClientSE.GET_MODULE_CHILDREN, moduleId);
    return children ?? [];
};
