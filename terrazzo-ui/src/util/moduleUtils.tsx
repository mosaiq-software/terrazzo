import { TrzModuleType, UID } from '@mosaiq/terrazzo-common';
import { IconType } from 'react-icons';
import { IoDocumentOutline } from 'react-icons/io5';
import { MdFolder, MdOutlineViewKanban } from 'react-icons/md';

export const getModuleRelativeUrl = (moduleType: TrzModuleType, moduleId: UID): string => {
    switch (moduleType) {
        case TrzModuleType.Document:
            return `/doc/${moduleId}`;
        case TrzModuleType.Board:
            return `/board/${moduleId}`;
        default:
            return '/';
    }
};

export const getModulePublicUrl = (moduleType: TrzModuleType, moduleId: UID): string => {
    const baseUrl = window.location.origin;
    switch (moduleType) {
        case TrzModuleType.Document:
            return `${baseUrl}/view/doc/${moduleId}`;
        case TrzModuleType.Board:
            return `${baseUrl}/view/board/${moduleId}`;
        default:
            return baseUrl;
    }
};

interface ModuleIconProps {
    moduleType: TrzModuleType;
}
export const ModuleIcon = (props: ModuleIconProps): IconType | undefined => {
    switch (props.moduleType) {
        case TrzModuleType.Directory:
            return MdFolder;
        case TrzModuleType.Document:
            return IoDocumentOutline;
        case TrzModuleType.Board:
            return MdOutlineViewKanban;
    }
};
