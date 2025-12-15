import { Loader } from '@mantine/core';
import { DirectoryHeader, DirectoryId, ModuleHeader, PermissibleAction, TrzModuleType } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateDirectoryMetadata } from '@trz/emitters/directoryEmitters';
import { useDirectory } from '@trz/hooks/useDirectory';
import { useModulePermission } from '@trz/hooks/usePermissions';
import { NoteType, notify } from '@trz/util/notifications';
import { useState } from 'react';
import { NotFound } from '../UI/NotFound';
import { ModuleSettingsLayout } from './ModuleSettingsLayout';

interface ModuleSettingsDirectoryProps {
    directoryId: DirectoryId;
    onClose: () => void;
}

export const ModuleSettingsDirectory = (props: ModuleSettingsDirectoryProps) => {
    const sockCtx = useSocket();
    const directory = useDirectory(props.directoryId);
    const userCanViewDirectory = useModulePermission(directory, PermissibleAction.ViewDirectory);
    const userCanEditDirectory = useModulePermission(directory, PermissibleAction.EditDirectory);
    const [directoryEdits, setDirectoryEdits] = useState<Partial<DirectoryHeader>>({});

    const onSave = async (explicit?: Partial<ModuleHeader>) => {
        try {
            if (!userCanEditDirectory) {
                throw new Error('You do not have permission to edit this directory.');
            }
            await updateDirectoryMetadata(sockCtx, props.directoryId, { ...directoryEdits, ...explicit, type: TrzModuleType.Directory });
            setDirectoryEdits({});
        } catch (e) {
            notify(NoteType.DOC_UPDATE_ERROR, e);
        }
    };

    if (!directory) {
        return <Loader />;
    }

    if (!userCanViewDirectory) {
        return (
            <NotFound
                itemType="directory"
                error={403}
            />
        );
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
            disabled={!userCanEditDirectory}
        />
    );
};
