import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '@trz/contexts/socket-context';
import { UserDash } from '@mosaiq/terrazzo-common/types';
import { useUser } from './user-context';
import { getUsersDash } from '@trz/emitters/all';
import { NoteType, notify } from '@trz/util/notifications';

type DashboardContextType = {
    userDash: UserDash | undefined;
    updateUserDash: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const DashboardProvider: React.FC<any> = ({ children }) => {
    const sockCtx = useSocket();
    const usr = useUser();
    const [userDash, setUserDash] = useState<UserDash | undefined>();

    const updateUserDash = async () => {
        if (!sockCtx.connected || !usr.userData?.id) {
            return;
        }
        try {
            const dash = await getUsersDash(sockCtx, usr.userData.id);
            setUserDash(dash);
        } catch (err) {
            notify(NoteType.DASH_ERROR, err);
            return;
        }
    };

    useEffect(() => {
        updateUserDash();
    }, [sockCtx.connected, usr.userData?.id]);

    return (
        <DashboardContext.Provider
            value={{
                userDash,
                updateUserDash,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

export { DashboardProvider, useDashboard };
