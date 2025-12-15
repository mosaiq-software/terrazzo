import { Container, Text } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { ModuleHeader, TrzModuleType } from '@mosaiq/terrazzo-common';
import { ModuleSettingsBoard } from './ModuleSettingBoard';
import { ModuleSettingsDirectory } from './ModuleSettingDirectory';
import { ModuleSettingsDocument } from './ModuleSettingDocument';

interface ModuleSettingsGenericProps {
    moduleHeader: ModuleHeader;
}

const ModuleSettings = (props: ContextModalProps<ModuleSettingsGenericProps>) => {
    const handleClose = () => {
        props.context.closeModal(props.id);
    };

    let Settings: React.ReactNode | null = null;
    switch (props.innerProps.moduleHeader.type) {
        case TrzModuleType.Directory:
            Settings = (
                <ModuleSettingsDirectory
                    directoryId={props.innerProps.moduleHeader.id}
                    onClose={handleClose}
                />
            );
            break;
        case TrzModuleType.Document:
            Settings = (
                <ModuleSettingsDocument
                    documentId={props.innerProps.moduleHeader.id}
                    onClose={handleClose}
                />
            );
            break;
        case TrzModuleType.Board:
            Settings = (
                <ModuleSettingsBoard
                    boardId={props.innerProps.moduleHeader.id}
                    onClose={handleClose}
                />
            );
            break;
        default:
            Settings = (
                <Text>
                    {props.innerProps.moduleHeader.name} is a {props.innerProps.moduleHeader.type}, which is not supported.
                </Text>
            );
    }

    return <Container onKeyDown={getHotkeyHandler([['Escape', handleClose]])}>{Settings}</Container>;
};

export const ModuleSettingsModal = (props: ContextModalProps<ModuleSettingsGenericProps>) => <ModuleSettings {...props} />;
