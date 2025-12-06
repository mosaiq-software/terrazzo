import { ModuleHeader, TrzModuleType } from './moduleTypes';
import { TrzModule } from './trzModuleTypes';

export interface DirectoryHeader extends ModuleHeader {
    type: TrzModuleType.Directory;
}

export interface Directory extends DirectoryHeader {
    modules: TrzModule[];
}
