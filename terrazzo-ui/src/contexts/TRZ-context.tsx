import { useLocalStorage } from '@mantine/hooks';
import { LocalStorageKey } from '@mosaiq/terrazzo-common/constants';
import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { BoardRes, DirectoryList, OrganizationHeader, OrganizationId } from '@mosaiq/terrazzo-common/types';
import { createOrganization, getOrganizationsForUser, getUserDirectoryStructure } from '@trz/emitters';
import { useRoom } from '@trz/hooks/useRoom';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './socket-context';
import { useUser } from './user-context';

export type TRZContextType = {
    animationDuration: number;
    navbarHeight: number;
    boardData: BoardRes | undefined;
    setBoardData: React.Dispatch<React.SetStateAction<BoardRes | undefined>>;
    selectedOrganization: OrganizationHeader | undefined;
    selectOrganization: (org: OrganizationHeader) => void;
    allOrganizations: OrganizationHeader[];
    userDirectoryStructure: DirectoryList | undefined;
    createOrganization: (orgName: string) => Promise<OrganizationHeader | undefined>;
};

const TRZContext = createContext<TRZContextType | undefined>(undefined);

const TRZProvider: React.FC<any> = ({ children }) => {
    const userCtx = useUser();
    const sockCtx = useSocket();
    const [animationDuration] = useState<number>(500);
    const [navbarHeight, setNavbarHeight] = useState<number>(50);
    const [boardData, setBoardData] = useState<BoardRes | undefined>(undefined);
    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationHeader | undefined>(undefined);
    const [allOrganizations, setAllOrganizations] = useState<OrganizationHeader[]>([]);
    const [lastSelectedOrgId, setLastSelectedOrgId] = useLocalStorage<OrganizationId | undefined>({ key: LocalStorageKey.LAST_SELECTED_ORG, defaultValue: undefined });
    const [userDirectoryStructure, setUserDirectoryStructure] = useState<DirectoryList | undefined>(undefined);
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
                setSelectedOrganization(initialOrg);
                setLastSelectedOrgId(initialOrg?.id);
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

    useSocketListener<ServerSE.UPDATE_BOARD_LABELS>(ServerSE.UPDATE_BOARD_LABELS, (payload) => {
        setBoardData((prev) => {
            if (prev?.id !== payload.boardId) {
                return prev;
            }
            return { ...prev, labels: payload.labels };
        });
    });

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

    const selectOrganization = (org: OrganizationHeader) => {
        setSelectedOrganization(org);
        setLastSelectedOrgId(org.id);
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
                boardData,
                setBoardData,
                selectedOrganization,
                selectOrganization,
                allOrganizations,
                userDirectoryStructure,
                createOrganization: createOrg,
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
