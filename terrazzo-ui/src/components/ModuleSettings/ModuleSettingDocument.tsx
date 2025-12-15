import { Loader } from '@mantine/core';
import { DocumentHeader, DocumentId, ModuleHeader, PermissibleAction, TrzModuleType } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateDocumentMetadata } from '@trz/emitters';
import { useDocument } from '@trz/hooks/useDocument';
import { useModulePermission } from '@trz/hooks/usePermissions';
import { NoteType, notify } from '@trz/util/notifications';
import { useState } from 'react';
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
    const [documentEdits, setDocumentEdits] = useState<Partial<DocumentHeader>>({});

    const onSave = async (explicit?: Partial<ModuleHeader>) => {
        try {
            if (!userCanEditDocument) {
                throw new Error('You do not have permission to edit this document.');
            }
            await updateDocumentMetadata(sockCtx, props.documentId, { ...documentEdits, ...explicit, type: TrzModuleType.Document });
            setDocumentEdits({});
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
                ...documentEdits,
            }}
            onChangeTitle={(newTitle) => {
                setDocumentEdits({ ...documentEdits, name: newTitle });
            }}
            onChangePermissions={(newPermissions) => {
                setDocumentEdits({ ...documentEdits, desiredPermissions: newPermissions });
            }}
            saved={Object.keys(documentEdits).length === 0}
            onSave={onSave}
            onClose={props.onClose}
            disabled={!userCanEditDocument}
        />
    );
};
