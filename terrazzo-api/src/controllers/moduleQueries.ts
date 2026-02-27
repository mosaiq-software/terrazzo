import { ModuleHeader, ModuleId, TrzModule, isModuleType } from '@mosaiq/terrazzo-common';
import { moduleHandler } from './dataSources/objectHandlers/module';

/**
 * Retrieves a module by ID and asserts it is of the expected type. Throws if the type does not match.
 * @throws Error if the module is not of the expected type
 */
export async function getModuleById<T extends TrzModule>(
    id: ModuleId,
    expectedType: T
): Promise<ModuleHeader<T> | undefined> {
    const module = await moduleHandler.read(id);
    if (!module) {
        return undefined;
    }
    if (!isModuleType(module, expectedType)) {
        throw new Error(`Module with id ${id} is not of type ${expectedType}`);
    }
    return module;
}

export async function getUntypedModuleById(id: ModuleId): Promise<ModuleHeader | undefined> {
    const module = await moduleHandler.read(id);
    if (!module) {
        return undefined;
    }
    return module;
}
