import { isModuleType, ModuleHeader, ModuleId, RoomType, ServerSE, TrzModule } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getUntypedModule } from '@trz/emitters/moduleEmitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useRoom } from './useRoom';
import { useSocketListener } from './useSocketListener';

export function useUntypedModule(moduleId?: ModuleId) {
    const [moduleData, setModuleData] = useState<ModuleHeader | undefined>();
    const sockCtx = useSocket();
    useRoom(RoomType.DATA, moduleId);
    useEffect(() => {
        const fetchModuleData = async () => {
            if (!moduleId || !sockCtx.connected) {
                return;
            }
            try {
                const moduleRes = await getUntypedModule(sockCtx, moduleId);
                setModuleData(moduleRes);
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
                return;
            }
        };
        fetchModuleData();
    }, [moduleId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_MODULE_FIELD,
        (payload) => {
            if (!moduleId || moduleId !== payload.id) {
                return;
            }
            setModuleData((prev) => {
                if (!prev) {
                    return prev;
                }
                const data = payload.data;
                delete payload.data;
                const updated: ModuleHeader = {
                    ...prev,
                    ...payload,
                    data: {
                        ...prev.data,
                        ...data,
                    },
                };
                return updated;
            });
        },
        [moduleId]
    );
    return moduleData;
}

export function useModule<T extends TrzModule>(
    moduleId: ModuleId | undefined,
    expectedType: T
): ModuleHeader<T> | undefined {
    const [moduleData, setModuleData] = useState<ModuleHeader<T> | undefined>();
    const sockCtx = useSocket();
    useRoom(RoomType.DATA, moduleId);

    useEffect(() => {
        const fetchModuleData = async () => {
            if (!moduleId || !sockCtx.connected) {
                return;
            }
            try {
                const moduleRes = await getUntypedModule(sockCtx, moduleId);
                if (!moduleRes) {
                    setModuleData(undefined);
                    return;
                }
                if (!isModuleType(moduleRes, expectedType)) {
                    setModuleData(undefined);
                    notify(NoteType.BOARD_DATA_ERROR, new Error('Received module of unexpected type'));
                    return;
                }
                setModuleData(moduleRes);
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
                return;
            }
        };
        fetchModuleData();
    }, [moduleId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_MODULE_FIELD,
        (payload) => {
            if (!moduleId || moduleId !== payload.id) {
                return;
            }
            setModuleData((prev) => {
                if (!prev) {
                    return prev;
                }
                const typedPayload = payload as Partial<ModuleHeader<T>>;
                const data = typedPayload.data;
                delete typedPayload.data;
                const updated: ModuleHeader<T> = {
                    ...prev,
                    ...typedPayload,
                    data: {
                        ...prev.data,
                        ...data,
                    },
                };
                return updated;
            });
        },
        [moduleId]
    );

    return moduleData;
}
