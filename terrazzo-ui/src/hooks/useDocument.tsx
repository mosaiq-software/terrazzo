import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { DocumentHeader, DocumentId, UserHeader } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { getDocument, getUserHeader } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useDocument = (documentId?: DocumentId) => {
    useRoom(RoomType.DATA, documentId);

    const [document, setDocument] = useState<DocumentHeader | undefined>(undefined);
    const [lastEditor, setLastEditor] = useState<UserHeader | null>(null);

    const sockCtx = useSocket();

    useEffect(() => {
        const fetchDocumentData = async () => {
            if (!documentId || !sockCtx.connected) {
                return;
            }
            if (document && document.id === documentId) {
                return;
            }
            try {
                const docRes = await getDocument(sockCtx, documentId);
                setDocument(docRes);
            } catch (err) {
                notify(NoteType.DOC_DATA_ERROR, err);
                return;
            }
        };
        fetchDocumentData();
    }, [documentId, sockCtx.connected]);

    useEffect(() => {
        const fetchLastEditor = async () => {
            if (!document) {
                return;
            }
            const lastEditor = await getUserHeader(sockCtx, document?.lastModifiedByUserId);
            setLastEditor(lastEditor || null);
        };
        fetchLastEditor();
    }, [document?.lastModifiedByUserId, sockCtx.connected]);

    useSocketListener(ServerSE.UPDATE_DOCUMENT_FIELD, (payload) => {
        if (payload.id !== documentId) {
            return;
        }
        setDocument((prev) => {
            if (!prev) {
                return prev;
            }
            return { ...updateBaseFromPartial(prev, payload) };
        });
    });

    return { document, lastEditor };
};
