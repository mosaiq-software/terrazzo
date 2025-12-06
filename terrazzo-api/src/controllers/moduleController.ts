import { calculateTrueModulePermissionsInOrg, ModuleHeader, TrzModuleType, UID } from '@mosaiq/terrazzo-common';
import { createModuleDb, getModuleByIdDb, getNextModuleOrderInParentDb } from '@trz-api/persistence/modulePersistence';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';
import { getAllRolePermissionsInOrg } from './roleController';

export const createNewModule = async (name: string, parentId: UID, type: TrzModuleType): Promise<ModuleHeader> => {
    const parentModule = await getModuleByIdDb(parentId);
    let orgId = parentModule?.orgId;
    if (!orgId) {
        const org = await getOrgById(parentId);
        if (!org) {
            throw new Error('Parent module or organization not found');
        }
        orgId = org.id;
    }
    const nextOrder = await getNextModuleOrderInParentDb(parentId);
    const newModule: ModuleHeader = {
        id: crypto.randomUUID(),
        parentId,
        name,
        type,
        orgId,
        order: nextOrder,
        archived: false,
        createdAt: Date.now(),
        desiredPermissions: {},
        effectivePermissions: {},
    };
    await createModuleDb(newModule);
    return newModule;
};

export const getModuleById = async (id: UID): Promise<ModuleHeader | undefined> => {
    const module = await getModuleByIdDb(id);
    if (!module) {
        return undefined;
    }
    const orgRolePerms = await getAllRolePermissionsInOrg(module.orgId);
    module.effectivePermissions = calculateTrueModulePermissionsInOrg(module.effectivePermissions, orgRolePerms);
    return module;
};
