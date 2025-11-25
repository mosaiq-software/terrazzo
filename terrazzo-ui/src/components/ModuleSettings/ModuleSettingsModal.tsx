import { Alert, Button, Container, ScrollArea, Stack, Text } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { ModuleHeader, TrzModuleType } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { updateBoardField, updateDocumentMetadata } from '@trz/emitters';
import { updateDirectoryMetadata } from '@trz/emitters/directoryEmitters';
import { NoteType, notify } from '@trz/util/notifications';
import { ModuleSettingsDirectory } from './ModuleSettingDirectory';
import { ModuleSettingsDocument } from './ModuleSettingDocument';

interface ModuleSettingsGenericProps {
    moduleHeader: ModuleHeader;
}

const ModuleSettings = (props: ContextModalProps<ModuleSettingsGenericProps>) => {
    const trz = useTRZ();
    const sockCtx = useSocket();

    const handleClose = () => {
        props.context.closeModal(props.id);
    };

    const handleUnarchive = () => {
        try {
            switch (props.innerProps.moduleHeader.type) {
                case TrzModuleType.Document:
                    updateDocumentMetadata(sockCtx, props.innerProps.moduleHeader.id, { archived: false });
                    break;
                case TrzModuleType.Directory:
                    updateDirectoryMetadata(sockCtx, props.innerProps.moduleHeader.id, { archived: false });
                    break;
                case TrzModuleType.Board:
                    updateBoardField(sockCtx, props.innerProps.moduleHeader.id, { archived: false });
                    break;
                default:
                    throw new Error('Unsupported module type for unarchiving ' + props.innerProps.moduleHeader.type);
            }
            notify(NoteType.CHANGES_SAVED);
        } catch (e: any) {
            notify(NoteType.GENERIC_ERROR, e);
        }
    };

    let Settings: React.ReactNode | null = null;

    if (props.innerProps.moduleHeader.archived) {
        Settings = (
            <Alert
                title="Archived Board"
                color="yellow"
            >
                <Stack>
                    <Text>This board is archived and can only be viewed.</Text>
                    <Button
                        variant="subtle"
                        onClick={handleUnarchive}
                    >
                        Unarchive Board
                    </Button>
                </Stack>
            </Alert>
        );
    } else {
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
            default:
                Settings = (
                    <Text>
                        {props.innerProps.moduleHeader.name} is a {props.innerProps.moduleHeader.type}, which is not supported.
                    </Text>
                );
        }
    }

    return (
        <Container onKeyDown={getHotkeyHandler([['Escape', handleClose]])}>
            <ScrollArea h={`calc(100vh - ${trz.navbarHeight}px)`}>{Settings}</ScrollArea>
        </Container>
    );
};

export const ModuleSettingsModal = (props: ContextModalProps<ModuleSettingsGenericProps>) => <ModuleSettings {...props} />;
