import { Loader } from '@mantine/core';
import { DocumentHeader, DocumentId, PermissibleAction } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateDocumentMetadata } from '@trz/emitters';
import { useDocument } from '@trz/hooks/useDocument';
import { useModulePermission } from '@trz/hooks/usePermissions';
import { NoteType, notify } from '@trz/util/notifications';
import { NotFound } from '../UI/NotFound';
import { ModuleSettingsLayout } from './ModuleSettingsLayout';

interface ModuleSettingsDocumentProps {
    documentId: DocumentId;
    onClose: () => void;
}

export const ModuleSettingsDocument = (props: ModuleSettingsDocumentProps) => {
    const sockCtx = useSocket();
    const { document } = useDocument(props.documentId);
    const userCanViewDocument = useModulePermission(document, PermissibleAction.ViewDocument);
    const userCanEditDocument = useModulePermission(document, PermissibleAction.EditDocument);

    const onSave = async (edits: Partial<DocumentHeader>) => {
        try {
            if (!userCanEditDocument) {
                throw new Error('You do not have permission to edit this document.');
            }
            await updateDocumentMetadata(sockCtx, props.documentId, { ...edits });
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
        <ModuleSettingsLayout
            moduleHeader={{
                ...document,
            }}
            onSave={onSave}
            onClose={props.onClose}
            disabled={!userCanEditDocument}
        />
    );
};
