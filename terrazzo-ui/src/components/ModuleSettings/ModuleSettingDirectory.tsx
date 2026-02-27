import { Fieldset, Loader, Stack } from '@mantine/core';
import { ModuleHeader, ModuleId, ModuleType, PermissibleAction, TrzModule, withIf } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateModuleField } from '@trz/emitters';
import { useModulePermission } from '@trz/hooks/data/usePermissions';
import { useModule } from '@trz/hooks/useModule';
import { useModuleChildren } from '@trz/hooks/useModuleChildren';
import { ModuleIcon } from '@trz/util/moduleUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { toTitleCase } from '@trz/util/textUtils';
import { useMemo } from 'react';
import { ActionRow } from '../UI/ActionRow';
import { NotFound } from '../UI/NotFound';
import { ModuleSettingsLayout } from './ModuleSettingsLayout';

interface ModuleSettingsDirectoryProps {
    directoryId: ModuleId;
    onClose: () => void;
}

export const ModuleSettingsDirectory = (props: ModuleSettingsDirectoryProps) => {
    const sockCtx = useSocket();
    const directory = useModule(props.directoryId, TrzModule.Directory);
    const userCanViewDirectory = useModulePermission(directory, PermissibleAction.ViewModules);
    const userCanEditDirectory = useModulePermission(directory, PermissibleAction.ManageModules);
    const contents = useModuleChildren(props.directoryId);

    const archivedSubitems = useMemo(() => {
        if (!contents) {
            return [];
        }
        return contents.filter((item) => item.archived);
    }, [contents]);

    const onSave = async (edits: Partial<ModuleHeader<TrzModule.Directory>>) => {
        try {
            if (!userCanEditDirectory) {
                throw new Error('You do not have permission to edit this directory.');
            }
            await updateModuleField(sockCtx, props.directoryId, {
                type: TrzModule.Directory,
                update: edits,
            });
        } catch (e) {
            notify(NoteType.DOC_UPDATE_ERROR, e);
        }
    };

    const onUnarchiveSubitem = async (itemId: ModuleId, itemType: ModuleType) => {
        try {
            if (!userCanEditDirectory) {
                throw new Error('You do not have permission to edit this directory.');
            }
            await updateModuleField(sockCtx, itemId, {
                type: itemType,
                update: { archived: false },
            });
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
        <ModuleSettingsLayout<TrzModule.Directory>
            moduleHeader={{
                ...directory,
            }}
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
