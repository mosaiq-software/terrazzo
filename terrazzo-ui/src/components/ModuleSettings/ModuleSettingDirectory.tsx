import { Fieldset, Loader, Stack } from '@mantine/core';
import { DirectoryHeader, DirectoryId, ModuleHeader, PermissibleAction, TrzModuleType, UID, withIf } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateBoardField, updateDocumentMetadata } from '@trz/emitters';
import { updateDirectoryMetadata } from '@trz/emitters/directoryEmitters';
import { useDirectory } from '@trz/hooks/useDirectory';
import { useDirectoryContents } from '@trz/hooks/useDirectoryContents';
import { useModulePermission } from '@trz/hooks/usePermissions';
import { NoteType, notify } from '@trz/util/notifications';
import { toTitleCase } from '@trz/util/textUtils';
import { useMemo, useState } from 'react';
import { IconType } from 'react-icons';
import { IoDocumentOutline } from 'react-icons/io5';
import { MdFolder, MdOutlineViewKanban } from 'react-icons/md';
import { ActionRow } from '../UI/ActionRow';
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
    const contents = useDirectoryContents(props.directoryId, TrzModuleType.Directory);

    const archivedSubitems = useMemo(() => {
        if (!contents) {
            return [];
        }
        return contents.filter((item) => item.archived);
    }, [contents]);

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

    const onUnarchiveSubitem = async (itemId: UID, itemType: TrzModuleType) => {
        try {
            if (!userCanEditDirectory) {
                throw new Error('You do not have permission to edit this directory.');
            }
            switch (itemType) {
                case TrzModuleType.Directory:
                    await updateDirectoryMetadata(sockCtx, itemId, { archived: false });
                    break;
                case TrzModuleType.Document:
                    await updateDocumentMetadata(sockCtx, itemId, { archived: false });
                    break;
                case TrzModuleType.Board:
                    await updateBoardField(sockCtx, itemId, { archived: false });
                    break;
                default:
                    throw new Error('Unsupported module type');
            }
            notify(NoteType.CHANGES_SAVED);
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
        >
            <Fieldset legend="Archived Items">
                <Stack>
                    {archivedSubitems.length === 0 && 'No archived items in this directory.'}
                    {archivedSubitems.map((item) => (
                        <ActionRow
                            key={item.id}
                            title={item.name}
                            subtitle={toTitleCase(item.type)}
                            icon={ModuleIcon({ moduleType: item.type })}
                            menuItems={[
                                ...withIf(
                                    {
                                        label: `Unarchive ${item.type}`,
                                        onClick: () => onUnarchiveSubitem(item.id, item.type),
                                    },
                                    userCanEditDirectory
                                ),
                            ]}
                        />
                    ))}
                </Stack>
            </Fieldset>
        </ModuleSettingsLayout>
    );
};

interface ModuleIconProps {
    moduleType: TrzModuleType;
}
const ModuleIcon = (props: ModuleIconProps): IconType | undefined => {
    switch (props.moduleType) {
        case TrzModuleType.Directory:
            return MdFolder;
        case TrzModuleType.Document:
            return IoDocumentOutline;
        case TrzModuleType.Board:
            return MdOutlineViewKanban;
    }
};
