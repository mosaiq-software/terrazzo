import React, { createContext, useEffect, useState } from 'react';
import { User, UserHeader } from '@mosaiq/terrazzo-common/types';
import { getUserDataFromGithub, revokeUserAccessToGithubAuth, tryLoginWithGithub } from '@trz/util/githubAuth';
import { readSessionStorageValue, useSessionStorage } from '@mantine/hooks';
import { LocalStorageKey } from '@mosaiq/terrazzo-common/constants';
import { useNavigate } from 'react-router-dom';
import { NoteType, notify } from '@trz/util/notifications';
import { setUpUserData } from '@trz/util/userUtils';

type UserContextType = {
    githubAuthToken: string | null;
    githubLogin: (code: string | undefined) => Promise<void>;
    logoutAll: () => void;
    userData: UserHeader | null;
    setUser: (newUser: User) => void;
    setUpAccount: (username: string, firstName: string, lastName: string) => Promise<void>;
};
const UserContext = createContext<UserContextType | undefined>(undefined);

export const FINISH_ACCOUNT_CREATION_ROUTE = '/create-account';
export const DEFAULT_AUTHED_ROUTE = '/dashboard';
export const DEFAULT_NO_AUTH_ROUTE = '/login';

const UserProvider: React.FC<any> = ({ children }) => {
    const [githubAuthToken, setGithubAuthToken] = useState<string | null>(null);
    const [loginRouteDestination, setLoginRouteDestination] = useSessionStorage<string | null>({ key: 'loginRouteDestination' });
    const [userData, setUser] = useState<UserHeader | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const tryLogin = async () => {
            const savedToken = localStorage.getItem(LocalStorageKey.GITHUB_ACCESS_TOKEN);
            console.log('Trying saved token:', savedToken);
            if (!savedToken) {
                return;
            }
            try {
                const user = await getUserDataFromGithub(savedToken);
                if (!user || typeof user === 'string') {
                    return { authToken: null, user: null };
                }
                setGithubAuthToken(savedToken);
                setUser(user);
            } catch (e) {
                console.error('Failed to fetch user data', e);
            }
        };
        tryLogin();
    }, []);

    const githubLogin = async (code: string | undefined): Promise<void> => {
        // check if user is already logged in - passthrough
        if (githubAuthToken && userData?.id) {
            navigate(DEFAULT_AUTHED_ROUTE);
            return;
        }

        // try and log them in using the code or saved token
        const { authToken, user } = await tryLoginWithGithub(code);
        if (!authToken || !user) {
            setLoginRouteDestination(window.location.pathname);
            navigate(DEFAULT_NO_AUTH_ROUTE);
            notify(NoteType.GITHUB_AUTH_ERROR);
            return;
        }

        setGithubAuthToken(authToken);
        setUser(user);

        //Account not set up yet
        if (!user.firstName?.length || !user.lastName?.length) {
            setLoginRouteDestination(DEFAULT_AUTHED_ROUTE);
            navigate(FINISH_ACCOUNT_CREATION_ROUTE);
            return;
        }

        // Account is set up and logged in
        const route = readSessionStorageValue<string | null>({ key: 'loginRouteDestination' });
        setLoginRouteDestination(null);
        if (route || code) {
            navigate(route || DEFAULT_AUTHED_ROUTE);
        }
    };

    const logoutAll = async () => {
        if (githubAuthToken) {
            await revokeUserAccessToGithubAuth(githubAuthToken);
        }
        localStorage.removeItem(LocalStorageKey.GITHUB_ACCESS_TOKEN);
        setGithubAuthToken(null);
        window.location.href = '/';
    };

    const setUpAccount = async (username: string, firstName: string, lastName: string) => {
        if (!userData) {
            throw new Error('No user found');
        }
        await setUpUserData(userData.id, username, firstName, lastName);
        setUser({ ...userData, username, firstName, lastName });
        const route = readSessionStorageValue<string | null>({ key: 'loginRouteDestination' });
        setLoginRouteDestination(null);
        navigate(route || DEFAULT_AUTHED_ROUTE);
    };

    return (
        <UserContext.Provider
            value={{
                githubAuthToken,
                githubLogin,
                logoutAll,
                userData,
                setUser,
                setUpAccount,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

const useUser = () => {
    const context = React.useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export { UserProvider, useUser };
