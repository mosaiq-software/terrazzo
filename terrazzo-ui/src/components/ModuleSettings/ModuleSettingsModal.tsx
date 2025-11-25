import { Container } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { ModuleHeader } from '@mosaiq/terrazzo-common/types';

interface ModuleSettingsGenericProps {
    moduleHeader: ModuleHeader;
}

const ModuleSettings = (props: ContextModalProps<ModuleSettingsGenericProps>) => {
    const handleClose = () => {
        props.context.closeModal(props.id);
    };

    return <Container onKeyDown={getHotkeyHandler([['Escape', handleClose]])}>Module Settings for {props.innerProps.moduleHeader.name}</Container>;
};

export const ModuleSettingsModal = (props: ContextModalProps<ModuleSettingsGenericProps>) => <ModuleSettings {...props} />;
