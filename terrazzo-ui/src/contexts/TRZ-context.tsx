import { useLocalStorage } from '@mantine/hooks';
import { LocalStorageKey } from '@mosaiq/terrazzo-common/constants';
import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { ModuleHeaderWithChildren, Organization, OrganizationHeader, OrganizationId, PermissionRecord, UID } from '@mosaiq/terrazzo-common/types';
import { overlayPermissionLevels } from '@mosaiq/terrazzo-common/utils/permissionUtils';
import { createOrganization, getOrganizationData, getOrganizationsForUser, getUserDirectoryStructure } from '@trz/emitters';
import { useRoom } from '@trz/hooks/useRoom';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSocket } from './socket-context';
import { useUser } from './user-context';

export type TRZContextType = {
    animationDuration: number;
    navbarHeight: number;
    selectedOrganization: Organization | undefined;
    selectOrganization: (orgId: OrganizationId) => void;
    allOrganizations: OrganizationHeader[];
    userDirectoryStructure: ModuleHeaderWithChildren | undefined;
    createOrganization: (orgName: string) => Promise<OrganizationHeader | undefined>;
    pageTitle: string;
    setPageTitle: React.Dispatch<React.SetStateAction<string>>;
    permissionRecords: Record<
        UID,
        {
            explicitPerms: PermissionRecord;
            inheritedPerms: PermissionRecord;
            combinedPerms: PermissionRecord;
        }
    >;
};

const TRZContext = createContext<TRZContextType | undefined>(undefined);

const TRZProvider: React.FC<any> = ({ children }) => {
    const userCtx = useUser();
    const sockCtx = useSocket();
    const [animationDuration] = useState<number>(500);
    const [navbarHeight, setNavbarHeight] = useState<number>(50);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | undefined>(undefined);
    const [allOrganizations, setAllOrganizations] = useState<OrganizationHeader[]>([]);
    const [lastSelectedOrgId, setLastSelectedOrgId] = useLocalStorage<OrganizationId | undefined>({ key: LocalStorageKey.LAST_SELECTED_ORG, defaultValue: undefined });
    const [userDirectoryStructure, setUserDirectoryStructure] = useState<ModuleHeaderWithChildren | undefined>(undefined);
    const [pageTitle, setPageTitle] = useState<string>('');
    useRoom(RoomType.DATA, selectedOrganization?.id, false);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!userCtx.userData?.id || !sockCtx.connected) return;
            try {
                const orgRes = await getOrganizationsForUser(sockCtx, userCtx.userData.id);
                if (!orgRes) {
                    throw new Error('Failed to fetch organizations for user.');
                }
                setAllOrganizations(orgRes);
                let initialOrg = orgRes.length > 0 ? orgRes[0] : undefined;
                if (lastSelectedOrgId) {
                    const matchedOrg = orgRes.find((org) => org.id === lastSelectedOrgId);
                    if (matchedOrg) {
                        initialOrg = matchedOrg;
                    }
                }

                if (initialOrg) {
                    selectOrganization(initialOrg.id);
                }
            } catch (e: any) {
                notify(NoteType.ORG_DATA_ERROR, e);
                setAllOrganizations([]);
            }
        };
        fetchInitialData();
    }, [userCtx.userData?.id, sockCtx.connected]);

    useEffect(() => {
        const fetchUserDirectoryStructure = async () => {
            if (!userCtx.userData?.id || !selectedOrganization || !sockCtx.connected) return;
            try {
                const directoryStructure = await getUserDirectoryStructure(sockCtx, userCtx.userData.id, selectedOrganization.id);
                setUserDirectoryStructure(directoryStructure || undefined);
            } catch (e: any) {
                notify(NoteType.ORG_DATA_ERROR, e);
                setUserDirectoryStructure(undefined);
            }
        };
        fetchUserDirectoryStructure();
    }, [userCtx.userData?.id, selectedOrganization, sockCtx.connected]);

    useSocketListener<ServerSE.UPDATE_USERS_DIRECTORY_STRUCTURE>(
        ServerSE.UPDATE_USERS_DIRECTORY_STRUCTURE,
        (payload) => {
            if (payload.userId !== userCtx.userData?.id || payload.orgId !== selectedOrganization?.id) {
                return;
            }
            setUserDirectoryStructure(payload.directoryStructure);
        },
        [selectedOrganization, userCtx.userData]
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

    const selectOrganization = async (orgId: OrganizationId) => {
        try {
            setLastSelectedOrgId(orgId);
            const fullOrg = await getOrganizationData(sockCtx, orgId);
            if (!fullOrg) {
                throw new Error(`Failed to fetch organization data for ID ${orgId}.`);
            }
            setSelectedOrganization(fullOrg);
        } catch (e: any) {
            notify(NoteType.ORG_DATA_ERROR, e);
        }
    };

    const createOrg = async (orgName: string) => {
        try {
            const orgId = await createOrganization(sockCtx, orgName);
            if (!orgId) {
                throw new Error('Organization creation failed');
            }
            const newOrg: OrganizationHeader = {
                id: orgId,
                name: orgName,
                archived: false,
                createdAt: Date.now(),
                logoUrl: '',
                isPersonalOrg: false,
                description: '',
            };
            setAllOrganizations((prev) => [...prev, newOrg]);
            return newOrg;
        } catch (e) {
            notify(NoteType.ORG_CREATION_ERROR, e);
        }
    };

    return (
        <TRZContext.Provider
            value={{
                animationDuration,
                navbarHeight,
                selectedOrganization,
                selectOrganization,
                allOrganizations,
                userDirectoryStructure,
                createOrganization: createOrg,
                pageTitle,
                setPageTitle,
                permissionRecords,
            }}
        >
            {children}
        </TRZContext.Provider>
    );
};

const useTRZ = () => {
    const context = useContext(TRZContext);
    if (context === undefined) {
        throw new Error('useTRZ must be used within a TRZProvider');
    }
    return context;
};

export { TRZProvider, useTRZ };
