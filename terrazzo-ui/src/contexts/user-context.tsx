import { readSessionStorageValue, useSessionStorage } from '@mantine/hooks';
import { LocalStorageKey, RestRoutes, UserHeader } from '@mosaiq/terrazzo-common';
import { callTrzApi } from '@trz/util/apiUtils';
import { isDev } from '@trz/util/envUtils';
import { getUserDataFromGithub, revokeUserAccessToGithubAuth, tryLoginWithGithub } from '@trz/util/githubAuth';
import { NoteType, notify } from '@trz/util/notifications';
import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type UserContextType = {
    githubAuthToken: string | null;
    githubLogin: (code: string | undefined) => Promise<void>;
    logoutAll: () => void;
    userData: UserHeader | null;
    setUser: (newUser: UserHeader) => void;
    devLogin: (username: string) => Promise<void>;
};
const UserContext = createContext<UserContextType | undefined>(undefined);

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
            if (isDev() && savedToken?.startsWith('DEV')) {
                const devUsername = savedToken.split('.')[1];
                devOnlyLogin(devUsername);
                return;
            }
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

        // Account is set up and logged in
        const route = readSessionStorageValue<string | null>({ key: 'loginRouteDestination' });
        setLoginRouteDestination(null);
        if (route || code) {
            navigate(route || DEFAULT_AUTHED_ROUTE);
        }
    };

    const logoutAll = async () => {
        if (githubAuthToken) {
            if (isDev() && githubAuthToken === 'DEV') {
                console.warn("Skipping auth token removal because it is 'DEV'");
            } else {
                await revokeUserAccessToGithubAuth(githubAuthToken);
            }
        }
        localStorage.removeItem(LocalStorageKey.GITHUB_ACCESS_TOKEN);
        setGithubAuthToken(null);
        window.location.href = '/';
    };

    const devOnlyLogin = async (username: string) => {
        if (!isDev()) {
            return;
        }
        const userHeader = (await callTrzApi<RestRoutes.USER_FAKE_DEV>(RestRoutes.USER_FAKE_DEV, { username }, undefined)) as UserHeader | undefined;
        if (!userHeader) {
            throw new Error('Failed to login as user');
        }
        setGithubAuthToken(`DEV.${userHeader.username}`);
        setUser(userHeader);
        localStorage.setItem(LocalStorageKey.GITHUB_ACCESS_TOKEN, `DEV.${userHeader.username}`);
    };

    return (
        <UserContext.Provider
            value={{
                githubAuthToken,
                githubLogin,
                logoutAll,
                userData,
                setUser,
                devLogin: devOnlyLogin,
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
