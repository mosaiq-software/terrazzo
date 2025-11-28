import { RestRoutes } from '@mosaiq/terrazzo-common/apiTypes';
import { UserHeader } from '@mosaiq/terrazzo-common/types';
import { isDev } from '@mosaiq/terrazzo-common/utils/envUtils';
import { callTrzApi } from '@trz/util/apiUtils';
import { NoteType, notify } from '@trz/util/notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type DevContextType = {
    DEV_allDevUsers: UserHeader[];
    DEV_createDevUser: () => Promise<UserHeader | undefined>;
    DEV_selectedUserOverride: UserHeader | null;
    DEV_setSelectedUserOverride: (user: UserHeader | null) => void;
};

const DevContext = createContext<DevContextType | undefined>(undefined);

const DevProvider: React.FC<any> = ({ children }) => {
    const [allDevUsers, setAllDevUsers] = useState<UserHeader[]>([]);
    const [selectedUserOverride, setSelectedUserOverride] = useState<UserHeader | null>(null);
    console.log('DevProvider selectedUserOverride:', selectedUserOverride);

    useEffect(() => {
        const fetchDevUsers = async () => {
            if (!isDev()) {
                return;
            }
            try {
                const devUsers = (await callTrzApi(RestRoutes.DEV_GET_ALL_DEV_USERS, {}, undefined)) as UserHeader[] | undefined;
                setAllDevUsers(devUsers || []);
            } catch (e: any) {
                notify(NoteType.GENERIC_ERROR, e);
                setAllDevUsers([]);
            }
        };
        fetchDevUsers();
    }, []);

    const createDevUser = async () => {
        if (!isDev()) {
            return;
        }
        try {
            const newUser = (await callTrzApi(RestRoutes.DEV_CREATE_FAKE_USER, {}, undefined)) as UserHeader | undefined;
            if (!newUser) {
                throw new Error('Failed to create new dev user.');
            }
            setAllDevUsers((prevUsers) => [...prevUsers, newUser]);
            notify(NoteType.CHANGES_SAVED, 'Successfully created new dev user.');
            return newUser;
        } catch (e: any) {
            notify(NoteType.GENERIC_ERROR, e);
            return undefined;
        }
    };

    return (
        <DevContext.Provider
            value={{
                DEV_allDevUsers: allDevUsers,
                DEV_createDevUser: createDevUser,
                DEV_selectedUserOverride: selectedUserOverride,
                DEV_setSelectedUserOverride: setSelectedUserOverride,
            }}
        >
            {children}
        </DevContext.Provider>
    );
};

const useDev = () => {
    const context = useContext(DevContext);
    if (context === undefined) {
        throw new Error('useDev must be used within a DevProvider');
    }
    return context;
};

export { DevProvider, useDev };
