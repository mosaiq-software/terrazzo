import { calculateModuleEffectivePermissions, calculateTrueModulePermissionsInOrg, evaluatePermissionForRoles, ModuleHeader, ModulePermissions, TrzModuleType, UID } from '@mosaiq/terrazzo-common';
import { createModuleDb, getModuleByIdDb, getModulesByParentIdDb, getNextModuleOrderInParentDb, updateModuleDb } from '@trz-api/persistence/modulePersistence';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';
import { getRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { getAllRolePermissionsInOrg } from './roleController';

export const createNewModule = async (name: string, parentId: UID, type: TrzModuleType): Promise<ModuleHeader> => {
    const parentModule = await getModuleById(parentId);
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

    const roles = await getRoleIdsForUserInOrgDb('147361ab-3b44-47f4-a5cd-bb2855f9a94d', module.orgId);
    console.log('User Roles:', roles);
    const userPerms = evaluatePermissionForRoles(roles, module.effectivePermissions);
    console.log('User Permissions:', userPerms);

    return module;
};

export const updateModule = async (id: UID, partial: Partial<ModuleHeader>): Promise<void> => {
    const desiredPermissions = partial.desiredPermissions;
    // handle simple fields
    delete partial.desiredPermissions;
    delete partial.effectivePermissions;
    await updateModuleDb(id, partial);

    if (!desiredPermissions) {
        return;
    }
    // handle permissions separately
    await updateModulePermissions(id, desiredPermissions);
};

const updateModulePermissions = async (id: UID, desiredPermissions: ModulePermissions): Promise<void> => {
    const module = await getModuleByIdDb(id);
    if (!module) {
        throw new Error('Module not found');
    }
    const parentModule = await getModuleByIdDb(module.parentId);
    const parentEffectivePermissions = parentModule?.effectivePermissions;
    const newEffectivePermissions = calculateModuleEffectivePermissions(parentEffectivePermissions, desiredPermissions);
    await updateModuleDb(id, {
        desiredPermissions,
        effectivePermissions: newEffectivePermissions,
    });
    await recursivelyUpdateModuleEffectivePermissions(id, newEffectivePermissions);
};

const recursivelyUpdateModuleEffectivePermissions = async (id: UID, parentEffectivePermissions: ModulePermissions): Promise<void> => {
    const childModules = await getModulesByParentIdDb(id);
    for (const childModule of childModules) {
        const newEffectivePermissions = calculateModuleEffectivePermissions(parentEffectivePermissions, childModule.desiredPermissions);
        await updateModuleDb(childModule.id, {
            effectivePermissions: newEffectivePermissions,
        });
        await recursivelyUpdateModuleEffectivePermissions(childModule.id, newEffectivePermissions);
    }
};
