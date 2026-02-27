import { useLocalStorage } from '@mantine/hooks';
import {
    LocalStorageKey,
    OrganizationHeader,
    OrganizationId,
    Role,
    RoomType,
    ServerSE,
    UserId,
} from '@mosaiq/terrazzo-common';
import { createOrganization, getOrganizationData, getOrganizationsForUser } from '@trz/emitters';
import { useRoom } from '@trz/hooks/util/useRoom';
import { useSocketListener } from '@trz/hooks/util/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSocket } from './socket-context';
import { useUserContext } from './user-context';
import { useOrgMembers } from '@trz/hooks/data/useOrgMembers';
import { useOrgRoles } from '@trz/hooks/data/useOrgRoles';

export type OrgContextType = {
    active: OrganizationHeader | undefined;
    selectOrganization: (orgId: OrganizationId | null | undefined) => Promise<void>;
    selectAndGoToOrganization: (orgId: OrganizationId | null | undefined) => Promise<void>;
    allOrganizations: OrganizationHeader[];
    members: UserId[];
    roles: Role[];
    createOrganization: (orgName: string) => Promise<OrganizationHeader | undefined>;
};

const OrgContext = createContext<OrgContextType | undefined>(undefined);

const OrgProvider: React.FC<any> = ({ children }) => {
    const userCtx = useUserContext();
    const sockCtx = useSocket();
    const navigate = useNavigate();
    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationHeader | undefined>(undefined);
    const [allOrganizations, setAllOrganizations] = useState<OrganizationHeader[]>([]);
    const [lastSelectedOrgId, setLastSelectedOrgId] = useLocalStorage<OrganizationId | undefined>({
        key: LocalStorageKey.LAST_SELECTED_ORG,
        defaultValue: undefined,
    });
    useRoom(RoomType.DATA, selectedOrganization?.id);
    const memberIds = useOrgMembers(selectedOrganization?.id);
    const roles = useOrgRoles(userCtx.userId ? selectedOrganization?.id : undefined);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!userCtx.userId || !sockCtx.connected) return;
            try {
                const orgRes = await getOrganizationsForUser(sockCtx, userCtx.userId);
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
    }, [userCtx.userId, sockCtx.connected]);

    useSocketListener(
        ServerSE.UPDATE_USERS_ORGANIZATIONS,
        (payload) => {
            if (payload.userId !== userCtx.userId) {
                return;
            }
            setAllOrganizations(payload.organizations);

            // if the user's selected organization was removed, clear it (user was removed from organization)
            if (selectedOrganization && !payload.organizations.find((org) => org.id === selectedOrganization.id)) {
                selectAndGoToOrganization(null);
            }
        },
        [userCtx.userId, selectedOrganization]
    );

    useSocketListener(
        ServerSE.UPDATE_ORG_FIELD,
        (payload) => {
            if (allOrganizations.findIndex((org) => org.id === payload.id) !== -1) {
                setAllOrganizations((prev) =>
                    prev.map((org) => {
                        if (org.id === payload.id) {
                            return { ...org, ...payload };
                        }
                        return org;
                    })
                );
            }
            if (selectedOrganization && payload.id === selectedOrganization.id) {
                setSelectedOrganization((prev) => {
                    if (!prev) {
                        return prev;
                    }
                    return { ...prev, ...payload };
                });
            }
        },
        [selectedOrganization]
    );

    const selectOrganization = useCallback(
        async (orgId: OrganizationId | null | undefined) => {
            try {
                setLastSelectedOrgId(orgId ?? undefined);
                if (!orgId) {
                    setSelectedOrganization(undefined);
                    return;
                }
                const orgHeader = await getOrganizationData(sockCtx, orgId);
                if (!orgHeader) {
                    throw new Error(`Failed to fetch organization data for ID ${orgId}.`);
                }
                setSelectedOrganization(orgHeader);
            } catch (e: any) {
                notify(NoteType.ORG_DATA_ERROR, e);
            }
        },
        [sockCtx, notify]
    );

    const selectAndGoToOrganization = useCallback(
        async (orgId: OrganizationId | null | undefined) => {
            await selectOrganization(orgId);
            if (orgId) {
                navigate(`/org/${orgId}`);
            } else {
                navigate('/dashboard');
            }
        },
        [selectOrganization, navigate]
    );

    const createOrg = useCallback(
        async (orgName: string) => {
            try {
                const orgId = await createOrganization(sockCtx, orgName);
                if (!orgId) {
                    throw new Error('Organization creation failed');
                }
                if (!userCtx.userId) {
                    throw new Error('User data not available');
                }
                const newOrg: OrganizationHeader = {
                    id: orgId,
                    name: orgName,
                    createdAt: Date.now(),
                    logoUrl: '',
                    description: '',
                    ownerId: userCtx.userId,
                };
                setAllOrganizations((prev) => [...prev, newOrg]);
                return newOrg;
            } catch (e) {
                notify(NoteType.ORG_CREATION_ERROR, e);
            }
        },
        [sockCtx, notify, userCtx.userId]
    );

    useEffect(() => {
        if (!userCtx.userId) {
            setSelectedOrganization(undefined);
            setAllOrganizations([]);
        }
    }, [userCtx.userId]);

    return (
        <OrgContext.Provider
            value={{
                active: selectedOrganization,
                selectOrganization,
                selectAndGoToOrganization,
                allOrganizations,
                createOrganization: createOrg,
                members: memberIds,
                roles,
            }}
        >
            {children}
        </OrgContext.Provider>
    );
};

const useOrg = () => {
    const context = useContext(OrgContext);
    if (context === undefined) {
        throw new Error('useOrg must be used within a OrgProvider');
    }
    return context;
};

export { OrgProvider, useOrg };
