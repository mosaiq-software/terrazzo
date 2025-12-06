import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { MinimalModuleHeader, TrzModuleType, UID } from '@mosaiq/terrazzo-common/types';
import { RoomSpecifier } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { getDirectoryContents } from '@trz/emitters/directoryEmitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useDirectoryContents = (moduleId: UID | undefined, moduleType: TrzModuleType) => {
    useRoom(RoomType.DATA, moduleId, RoomSpecifier.CONTENTS);
    const [contents, setContents] = useState<MinimalModuleHeader[] | undefined>(undefined);
    const sockCtx = useSocket();

    useEffect(() => {
        const fetchDirectoryContents = async () => {
            if (!moduleId || !sockCtx.connected) {
                return;
            }
            if (![TrzModuleType.Directory, TrzModuleType.Organization].includes(moduleType)) {
                return;
            }
            try {
                const res = await getDirectoryContents(sockCtx, moduleId);
                if (!res) {
                    throw new Error('No contents found');
                }
                setContents(res);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
                return;
            }
        };
        fetchDirectoryContents();
    }, [moduleId, moduleType, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_DIRECTORY_CONTENTS,
        (payload) => {
            if (payload.directoryId !== moduleId) {
                return;
            }
            setContents(payload.contents);
        },
        [moduleId]
    );

    return contents;
};
