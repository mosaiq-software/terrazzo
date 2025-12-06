import { Button, Loader, Stack, TextInput } from '@mantine/core';
import { DirectoryHeader, DirectoryId } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateDirectoryMetadata } from '@trz/emitters/directoryEmitters';
import { useDirectory } from '@trz/hooks/useDirectory';
import { NoteType, notify } from '@trz/util/notifications';
import { useState } from 'react';
import { PermissionsEditor } from './PermissionsEditor/PermissionsEditor';

interface ModuleSettingsDirectoryProps {
    directoryId: DirectoryId;
    onClose: () => void;
}

export const ModuleSettingsDirectory = (props: ModuleSettingsDirectoryProps) => {
    const sockCtx = useSocket();
    const directory = useDirectory(props.directoryId);
    const [directoryEdits, setDirectoryEdits] = useState<Partial<DirectoryHeader>>({});

    const onSave = async () => {
        try {
            await updateDirectoryMetadata(sockCtx, props.directoryId, directoryEdits);
            setDirectoryEdits({});
            props.onClose();
        } catch (e) {
            notify(NoteType.DOC_UPDATE_ERROR, e);
        }
    };

    if (!directory) {
        return <Loader />;
    }

    return (
        <Stack>
            <TextInput
                labelProps={{
                    c: 'white',
                }}
                label="Directory Name"
                placeholder="My Directory"
                required
                value={directoryEdits.name ?? directory.name ?? ''}
                onChange={(e) => {
                    setDirectoryEdits({ ...directoryEdits, name: e.target.value });
                }}
            />
            <PermissionsEditor
                desiredPermissions={directoryEdits.desiredPermissions ?? directory.desiredPermissions}
                onChange={(newPermissions) => {
                    setDirectoryEdits({ ...directoryEdits, desiredPermissions: newPermissions });
                }}
            />
            <Button
                disabled={Object.keys(directoryEdits).length === 0}
                onClick={onSave}
            >
                Save Changes
            </Button>
        </Stack>
    );
};
