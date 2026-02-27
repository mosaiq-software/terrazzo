import { TrzModule, UID } from '@mosaiq/terrazzo-common';
import { IconType } from 'react-icons';
import { IoDocumentOutline } from 'react-icons/io5';
import { MdFolder, MdOutlineViewKanban } from 'react-icons/md';

export const getModuleRelativeUrl = (moduleType: TrzModule, moduleId: UID): string => {
    switch (moduleType) {
        case TrzModule.Document:
            return `/doc/${moduleId}`;
        case TrzModule.Board:
            return `/board/${moduleId}`;
        default:
            return '/';
    }
};

export const getModulePublicUrl = (moduleType: TrzModule, moduleId: UID): string => {
    const baseUrl = window.location.origin;
    switch (moduleType) {
        case TrzModule.Document:
            return `${baseUrl}/doc/${moduleId}`;
        case TrzModule.Board:
            return `${baseUrl}/board/${moduleId}`;
        default:
            return baseUrl;
    }
};

interface ModuleIconProps {
    moduleType: TrzModule;
}
export const ModuleIcon = (props: ModuleIconProps): IconType | undefined => {
    switch (props.moduleType) {
        case TrzModule.Directory:
            return MdFolder;
        case TrzModule.Document:
            return IoDocumentOutline;
        case TrzModule.Board:
            return MdOutlineViewKanban;
    }
};
