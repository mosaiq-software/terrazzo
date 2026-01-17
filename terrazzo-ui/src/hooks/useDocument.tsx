import { DocumentHeader, DocumentId, RoomType, ServerSE, updateBaseFromPartial } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getDocument } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';
import { useUser } from './useUser';

export interface UseDocumentOptions {
    fetchLastEditor?: boolean;
}
export const useDocument = (documentId?: DocumentId, options?: UseDocumentOptions) => {
    useRoom(RoomType.DATA, documentId);

    const [document, setDocument] = useState<DocumentHeader | undefined>(undefined);
    const lastEditor = useUser(options?.fetchLastEditor ? document?.lastModifiedByUserId : undefined);

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

    useSocketListener(
        ServerSE.UPDATE_DOCUMENT_FIELD,
        (payload) => {
            if (payload.id !== documentId) {
                return;
            }
            setDocument((prev) => {
                if (!prev) {
                    return prev;
                }
                return { ...updateBaseFromPartial(prev, payload) };
            });
        },
        [documentId]
    );

    return { document, lastEditor };
};
