import { Loader } from '@mantine/core';
import { DirectoryHeader, DirectoryId } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateDirectoryMetadata } from '@trz/emitters/directoryEmitters';
import { useDirectory } from '@trz/hooks/useDirectory';
import { NoteType, notify } from '@trz/util/notifications';
import { useState } from 'react';
import { ModuleSettingsLayout } from './ModuleSettingsLayout';

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
        } catch (e) {
            notify(NoteType.DOC_UPDATE_ERROR, e);
        }
    };

    if (!directory) {
        return <Loader />;
    }

    return (
        <ModuleSettingsLayout
            moduleHeader={{
                ...directory,
                ...directoryEdits,
            }}
            onChangeTitle={(newTitle) => {
                setDirectoryEdits({ ...directoryEdits, name: newTitle });
            }}
            onChangePermissions={(newPermissions) => {
                setDirectoryEdits({ ...directoryEdits, desiredPermissions: newPermissions });
            }}
            saved={Object.keys(directoryEdits).length === 0}
            onSave={onSave}
            onClose={props.onClose}
        />
    );
};
