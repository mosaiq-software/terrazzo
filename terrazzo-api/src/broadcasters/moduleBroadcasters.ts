import { getRoomCode, ModuleHeader, ModuleId, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { getDirectoryContentsForUser } from '@trz-api/controllers/directoryController';
import { getUntypedModuleById } from '@trz-api/controllers/moduleController';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketUtils';

export const syncParentsModuleChildren = async (childId: ModuleId) => {
    try {
        const childModule = await getUntypedModuleById(childId);
        if (!childModule) {
            throw new Error('Child module not found for syncing parent module children');
        }
        const parentId = childModule.parentId;
        await syncModuleChildren(parentId);
    } catch (error: any) {
        console.error('Error syncing parent module children', error);
    }
};

export const syncModuleChildren = async (moduleId: ModuleId) => {
    try {
        broadcast({
            event: ServerSE.UPDATE_MODULE_CHILDREN,
            toRoomIds: [getRoomCode(RoomType.DATA, moduleId, RoomSpecifier.CONTENTS)],
            buildPayload: async (userId) => {
                if (!userId) {
                    throw new Error('No userId provided for syncing module children');
                }
                if (!(await userCanViewModule(userId, moduleId))) {
                    throw new Error('Insufficient permissions to view this module and its children');
                }
                const children = await getDirectoryContentsForUser(moduleId, userId);
                return { moduleId, children: children.map((child) => child.id) };
            },
        });
    } catch (error: any) {
        console.error('Error syncing module children', error);
    }
};

export const syncModuleField = async (module: ModuleHeader) => {
    await broadcast({
        event: ServerSE.UPDATE_MODULE_FIELD,
        toRoomIds: [getRoomCode(RoomType.DATA, module.id)],
        buildPayload: async (userId) => {
            if (!(await userCanViewModule(userId, module.id))) {
                throw new Error('Insufficient permissions to view this module');
            }
            return module;
        },
    });
};
