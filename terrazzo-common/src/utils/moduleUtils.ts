import { TrzModuleType, ModuleHeader } from '../types/modules/moduleTypes';

/**
 * Type assertion helper to ensure a module is of the expected type. Throws if the type does not match.
 */
export const isModuleType = <T extends TrzModuleType>(module: ModuleHeader, type: T): module is ModuleHeader<T> => {
    return module.type === type;
};
