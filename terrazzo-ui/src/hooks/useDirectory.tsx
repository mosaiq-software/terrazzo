import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { DirectoryHeader, DirectoryId } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { getDirectory } from '@trz/emitters/directoryEmitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useDirectory = (directoryId?: DirectoryId) => {
    useRoom(RoomType.DATA, directoryId, false);
    const [directory, setDirectory] = useState<DirectoryHeader | undefined>(undefined);
    const sockCtx = useSocket();

    useEffect(() => {
        const fetchDirectoryData = async () => {
            if (!directoryId || !sockCtx.connected) {
                return;
            }
            if (directory && directory.id === directoryId) {
                return;
            }
            try {
                const dirRes = await getDirectory(sockCtx, directoryId);
                setDirectory(dirRes);
            } catch (err) {
                notify(NoteType.DOC_DATA_ERROR, err);
                return;
            }
        };
        fetchDirectoryData();
    }, [directoryId, sockCtx.connected]);

    useSocketListener(ServerSE.UPDATE_DIRECTORY_FIELD, (payload) => {
        if (payload.id !== directoryId) {
            return;
        }
        setDirectory((prev) => {
            if (!prev) {
                return prev;
            }
            return { ...updateBaseFromPartial(prev, payload) };
        });
    });

    return directory;
};
