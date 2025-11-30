import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { ModuleHeaderWithChildren, PermissionRecord, UID } from '@mosaiq/terrazzo-common/types';
import { overlayPermissionLevels } from '@mosaiq/terrazzo-common/utils/permissionUtils';
import { RoomSpecifier } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { getUserDirectoryStructure } from '@trz/emitters';
import { useRoom } from '@trz/hooks/useRoom';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useOrg } from './org-context';
import { useSocket } from './socket-context';
import { useUser } from './user-context';

export type UserDirectoryContextType = {
    userDirectoryStructure: ModuleHeaderWithChildren | undefined;
    permissionRecords: Record<
        UID,
        {
            explicitPerms: PermissionRecord;
            inheritedPerms: PermissionRecord;
            combinedPerms: PermissionRecord;
        }
    >;
};

const UserDirectoryContext = createContext<UserDirectoryContextType | undefined>(undefined);

const UserDirectoryProvider: React.FC<any> = ({ children }) => {
    const userCtx = useUser();
    const sockCtx = useSocket();
    const org = useOrg();
    const [userDirectoryStructure, setUserDirectoryStructure] = useState<ModuleHeaderWithChildren | undefined>(undefined);
    useRoom(RoomType.DATA, org.active?.id, RoomSpecifier.STRUCTURE);

    useEffect(() => {
        const fetchUserDirectoryStructure = async () => {
            if (!userCtx.userData?.id || !org.active || !sockCtx.connected) {
                setUserDirectoryStructure(undefined);
                return;
            }
            try {
                const directoryStructure = await getUserDirectoryStructure(sockCtx, userCtx.userData.id, org.active.id);
                setUserDirectoryStructure(directoryStructure || undefined);
            } catch (e: any) {
                notify(NoteType.ORG_DATA_ERROR, e);
                setUserDirectoryStructure(undefined);
            }
        };
        fetchUserDirectoryStructure();
    }, [userCtx.userData?.id, org.active, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_USERS_DIRECTORY_STRUCTURE,
        (payload) => {
            if (payload.userId !== userCtx.userData?.id || payload.orgId !== org.active?.id) {
                return;
            }
            setUserDirectoryStructure(payload.directoryStructure);
        },
        [org.active, userCtx.userData]
    );

    const permissionRecords = useMemo(() => {
        const permRecords: Record<
            UID,
            {
                explicitPerms: PermissionRecord;
                inheritedPerms: PermissionRecord;
                combinedPerms: PermissionRecord;
            }
        > = {};
        const traverse = (module: ModuleHeaderWithChildren, parentId: UID | null) => {
            const parentPerms = parentId ? permRecords[parentId].combinedPerms : null;
            const explicitPerms: PermissionRecord = {
                anyonePermissionLevel: module.anyonePermissionLevel,
                orgPermissionLevel: module.orgPermissionLevel,
                userPermissionLevels: { ...module.userPermissionLevels },
            };
            const inheritedPerms: PermissionRecord = parentPerms ?? {
                anyonePermissionLevel: null,
                orgPermissionLevel: null,
                userPermissionLevels: {},
            };
            const combinedPerms = overlayPermissionLevels(inheritedPerms, explicitPerms);
            permRecords[module.id] = {
                explicitPerms,
                inheritedPerms,
                combinedPerms,
            };
            if (module.children) {
                for (const child of module.children) {
                    traverse(child, module.id);
                }
            }
        };
        if (userDirectoryStructure) {
            traverse(userDirectoryStructure, null);
        }
        return permRecords;
    }, [userDirectoryStructure]);

    return (
        <UserDirectoryContext.Provider
            value={{
                userDirectoryStructure,
                permissionRecords,
            }}
        >
            {children}
        </UserDirectoryContext.Provider>
    );
};

const useDirectoryContext = () => {
    const context = useContext(UserDirectoryContext);
    if (context === undefined) {
        throw new Error('useDirectoryContext must be used within a UserDirectoryProvider');
    }
    return context;
};

export { useDirectoryContext, UserDirectoryProvider };
