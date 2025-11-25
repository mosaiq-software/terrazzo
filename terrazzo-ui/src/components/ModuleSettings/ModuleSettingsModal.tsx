import { Container } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';

interface ModuleSettingsGenericProps {}

const ModuleSettings = (props: ContextModalProps<ModuleSettingsGenericProps>) => {
    const handleClose = () => {
        props.context.closeModal(props.id);
    };

    return <Container onKeyDown={getHotkeyHandler([['Escape', handleClose]])}>test</Container>;
};

export const ModuleSettingsModal = (props: ContextModalProps<ModuleSettingsGenericProps>) => <ModuleSettings {...props} />;
