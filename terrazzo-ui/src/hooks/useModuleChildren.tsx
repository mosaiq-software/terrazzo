import { ModuleId, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { getModuleChildren } from '@trz/emitters/moduleEmitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export const useModuleChildren = (moduleId: ModuleId | undefined) => {
    useRoom(RoomType.DATA, moduleId, RoomSpecifier.CONTENTS);
    const orgCtx = useOrg();

    const [children, setChildren] = useState<ModuleId[]>([]);
    const sockCtx = useSocket();

    useEffect(() => {
        const fetchDirectoryContents = async () => {
            if (!moduleId || !sockCtx.connected) {
                return;
            }
            try {
                const res = await getModuleChildren(sockCtx, moduleId);
                if (!res) {
                    throw new Error('No contents found');
                }
                setChildren(res);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
                return;
            }
        };
        fetchDirectoryContents();
    }, [moduleId, sockCtx.connected, orgCtx.roles]);

    useSocketListener(
        ServerSE.UPDATE_MODULE_CHILDREN,
        (payload) => {
            if (payload.moduleId !== moduleId) {
                return;
            }
            setChildren(payload.children);
        },
        [moduleId]
    );

    return children;
};
