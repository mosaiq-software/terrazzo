import { calculateModuleEffectivePermissions, ModuleHeader, ObjectSource } from '@mosaiq/terrazzo-common';
import { buildModuleData, recursivelyUpdateModuleEffectivePermissions } from '@trz-api/controllers/moduleController';
import {
    createModuleDb,
    getModuleByIdDb,
    getNextModuleOrderInParentDb,
    updateModuleDataDb,
    updateModuleDb,
} from '@trz-api/persistence/modulePersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const moduleHandler = objectSourceHandlers(ObjectSource.Module, {
    create: async (data) => {
        // Resolve orgId from parent
        const parentModule = await getModuleByIdDb(data.parentId);
        let orgId = parentModule?.orgId;
        if (!orgId) {
            const org = await getOrgByIdDb(data.parentId);
            if (!org) {
                throw new Error('Parent module or organization not found');
            }
            orgId = org.id;
        }

        const order = data.order ?? (await getNextModuleOrderInParentDb(data.parentId));
        const moduleData = data.data ?? (await buildModuleData({ type: data.type, initialData: data }));

        const newModule: ModuleHeader = {
            id: crypto.randomUUID(),
            parentId: data.parentId,
            name: data.name,
            type: data.type,
            orgId,
            order: order,
            archived: false,
            createdAt: Date.now(),
            desiredPermissions: {},
            effectivePermissions: {},
            public: false,
            data: moduleData,
        };
        await createModuleDb(newModule);
        return newModule.id;
    },
    update: async (id, data) => {
        // Build simple field updates (excluding permissions and data which are handled separately)
        const { desiredPermissions, effectivePermissions, data: moduleData, ...simpleFields } = data;

        if (simpleFields && Object.keys(simpleFields).length > 0) {
            await updateModuleDb(id, simpleFields);
        }
        if (moduleData && Object.keys(moduleData).length > 0) {
            const module = await getModuleByIdDb(id);
            if (!module) {
                throw new Error('Module not found');
            }
            await updateModuleDataDb(id, module.type, moduleData);
        }
        if (desiredPermissions) {
            const module = await getModuleByIdDb(id);
            if (!module) {
                throw new Error('Module not found');
            }
            const parentModule = await getModuleByIdDb(module.parentId);
            const parentEffectivePermissions = parentModule?.effectivePermissions;
            const newEffectivePermissions = calculateModuleEffectivePermissions(
                parentEffectivePermissions,
                desiredPermissions
            );
            await updateModuleDb(id, {
                desiredPermissions,
                effectivePermissions: newEffectivePermissions,
            });
            await recursivelyUpdateModuleEffectivePermissions(id, newEffectivePermissions);
        }
    },
    read: async (id) => {
        return (await getModuleByIdDb(id)) || undefined;
    },
});
