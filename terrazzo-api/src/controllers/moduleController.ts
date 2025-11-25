import { ModuleHeader, TrzModuleType, UID } from '@mosaiq/terrazzo-common/types';
import { createModuleDb, getModuleByIdDb } from '@trz-api/persistence/modulePersistence';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';

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

    const newModule: ModuleHeader = {
        id: crypto.randomUUID(),
        parentId,
        name,
        type,
        orgId,
        archived: false,
        createdAt: Date.now(),
        anyonePermissionLevel: null,
        orgPermissionLevel: null,
        userPermissionLevels: {},
    };
    await createModuleDb(newModule);
    return newModule;
};
