import { Loader } from '@mantine/core';
import { ModuleHeader, ModuleId, PermissibleAction, TrzModule } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateModuleField } from '@trz/emitters';
import { useModulePermission } from '@trz/hooks/data/usePermissions';
import { NoteType, notify } from '@trz/util/notifications';
import { NotFound } from '../UI/NotFound';
import { ModuleSettingsLayout } from './ModuleSettingsLayout';
import { useModule } from '@trz/hooks/data/useModule';

interface ModuleSettingsDocumentProps {
    documentId: ModuleId;
    onClose: () => void;
}

export const ModuleSettingsDocument = (props: ModuleSettingsDocumentProps) => {
    const sockCtx = useSocket();
    const document = useModule(props.documentId, TrzModule.Document);
    const userCanViewDocument = useModulePermission(document, PermissibleAction.ViewModules);
    const userCanEditDocument = useModulePermission(document, PermissibleAction.ManageModules);

    const onSave = async (edits: Partial<ModuleHeader<TrzModule.Document>>) => {
        try {
            if (!userCanEditDocument) {
                throw new Error('You do not have permission to edit this document.');
            }
            await updateModuleField(sockCtx, props.documentId, {
                type: TrzModule.Document,
                update: edits,
            });
        } catch (e) {
            notify(NoteType.DOC_UPDATE_ERROR, e);
        }
    };

    if (!document) {
        return <Loader />;
    }

    if (!userCanViewDocument) {
        return (
            <NotFound
                itemType="document"
                error={403}
            />
        );
    }

    return (
        <ModuleSettingsLayout<TrzModule.Document>
            moduleHeader={{
                ...document,
            }}
            onSave={onSave}
            onClose={props.onClose}
            disabled={!userCanEditDocument}
        />
    );
};
