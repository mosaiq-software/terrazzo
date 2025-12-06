import { Button, Loader, Stack, TextInput } from '@mantine/core';
import { DocumentHeader, DocumentId } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { updateDocumentMetadata } from '@trz/emitters';
import { useDocument } from '@trz/hooks/useDocument';
import { NoteType, notify } from '@trz/util/notifications';
import { useState } from 'react';
import { PermissionsEditor } from './PermissionsEditor/PermissionsEditor';

interface ModuleSettingsDocumentProps {
    documentId: DocumentId;
    onClose: () => void;
}

export const ModuleSettingsDocument = (props: ModuleSettingsDocumentProps) => {
    const sockCtx = useSocket();
    const { document } = useDocument(props.documentId);
    const [documentEdits, setDocumentEdits] = useState<Partial<DocumentHeader>>({});

    const onSave = async () => {
        try {
            await updateDocumentMetadata(sockCtx, props.documentId, documentEdits);
            setDocumentEdits({});
            props.onClose();
        } catch (e) {
            notify(NoteType.DOC_UPDATE_ERROR, e);
        }
    };

    if (!document) {
        return <Loader />;
    }

    return (
        <Stack>
            <TextInput
                labelProps={{
                    c: 'white',
                }}
                label="Document Name"
                placeholder="My Document"
                required
                value={documentEdits.name ?? document.name ?? ''}
                onChange={(e) => {
                    setDocumentEdits({ ...documentEdits, name: e.target.value });
                }}
            />
            <PermissionsEditor moduleId={props.documentId} />
            <Button
                disabled={Object.keys(documentEdits).length === 0}
                onClick={onSave}
            >
                Save Changes
            </Button>
        </Stack>
    );
};
