import { calculateModuleEffectivePermissions, ModuleHeader, ObjectSource, UID } from '@mosaiq/terrazzo-common';
import {
    createModuleDb,
    getModuleByIdDb,
    getModulesByParentIdDb,
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

        const newModule: ModuleHeader = {
            id: crypto.randomUUID(),
            parentId: data.parentId,
            name: data.name,
            type: data.type,
            orgId,
            order: data.order,
            archived: false,
            createdAt: Date.now(),
            desiredPermissions: {},
            effectivePermissions: {},
            public: false,
            data: data.data,
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

const recursivelyUpdateModuleEffectivePermissions = async (
    id: UID,
    parentEffectivePermissions: Record<string, any>
): Promise<void> => {
    const childModules = await getModulesByParentIdDb(id);
    for (const childModule of childModules) {
        const newEffectivePermissions = calculateModuleEffectivePermissions(
            parentEffectivePermissions,
            childModule.desiredPermissions
        );
        await updateModuleDb(childModule.id, {
            effectivePermissions: newEffectivePermissions,
        });
        await recursivelyUpdateModuleEffectivePermissions(childModule.id, newEffectivePermissions);
    }
};
