import { ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { BoardRes, OrganizationHeader } from '@mosaiq/terrazzo-common/types';
import { getOrganizationsForUser } from '@trz/emitters';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './socket-context';
import { useUser } from './user-context';

export type TRZContextType = {
    navbarHeight: number;
    boardData: BoardRes | undefined;
    setBoardData: React.Dispatch<React.SetStateAction<BoardRes | undefined>>;
    selectedOrganization: OrganizationHeader | undefined;
    setSelectedOrganization: React.Dispatch<React.SetStateAction<OrganizationHeader | undefined>>;
    allOrganizations: OrganizationHeader[];
};

const TRZContext = createContext<TRZContextType | undefined>(undefined);

const TRZProvider: React.FC<any> = ({ children }) => {
    const userCtx = useUser();
    const sockCtx = useSocket();
    const [navbarHeight, setNavbarHeight] = useState<number>(50);
    const [boardData, setBoardData] = useState<BoardRes | undefined>(undefined);
    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationHeader | undefined>(undefined);
    const [allOrganizations, setAllOrganizations] = useState<OrganizationHeader[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            console.log('Fetching organizations for user in TRZProvider', userCtx.userData?.id);
            if (!userCtx.userData?.id) return;
            try {
                const orgRes = await getOrganizationsForUser(sockCtx, userCtx.userData.id);
                if (!orgRes) {
                    throw new Error('Failed to fetch organizations for user.');
                }
                console.log('Fetched organizations:', orgRes);
                setAllOrganizations(orgRes);
            } catch (e: any) {
                notify(NoteType.ORG_DATA_ERROR, e);
                setAllOrganizations([]);
            }
        };
        fetchInitialData();
    }, [userCtx.userData?.id]);

    useSocketListener<ServerSE.UPDATE_BOARD_LABELS>(ServerSE.UPDATE_BOARD_LABELS, (payload) => {
        setBoardData((prev) => {
            if (prev?.id !== payload.boardId) {
                return prev;
            }
            return { ...prev, labels: payload.labels };
        });
    });

    return (
        <TRZContext.Provider
            value={{
                navbarHeight,
                boardData,
                setBoardData,
                selectedOrganization,
                setSelectedOrganization,
                allOrganizations,
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
