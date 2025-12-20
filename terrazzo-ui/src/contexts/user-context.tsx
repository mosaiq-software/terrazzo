import { useLocalStorage, useSessionStorage } from '@mantine/hooks';
import { AuthProvider, AuthProviderCallbackBody, AuthProviderCallbackData, AuthProviderToken, RestRoutes, UserId } from '@mosaiq/terrazzo-common';
import { callTrzApi } from '@trz/util/apiUtils';
import { isDev } from '@trz/util/envUtils';
import { NoteType, notify } from '@trz/util/notifications';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type UserContextType = {
    userId: UserId | undefined;
    authToken: string | undefined;
    handleLogin: (userId: UserId, trzAuthToken: string, provider: AuthProvider, providerAuthToken: string) => void;
    clearLocalLoginData: () => void;
    devLogin: (username: string) => Promise<void>;
    goToLogin: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_AUTHED_ROUTE = '/dashboard';
const DEFAULT_NO_AUTH_ROUTE = '/login';
const SESSION_POST_LOGIN_REDIRECT_KEY = 'login-route-destination';
const LOCAL_SAVED_AUTH_PROVIDER_KEY = 'saved-auth-provider';

const UserProvider: React.FC<any> = ({ children }) => {
    const [userId, setUserId] = useState<UserId | undefined>(undefined);
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);
    const navigate = useNavigate();
    const [localSavedAuthProvider, setLocalSavedAuthProvider, removeLocalSavedAuthProvider] = useLocalStorage({ key: LOCAL_SAVED_AUTH_PROVIDER_KEY });
    const [sessionSavedLoginRoute, setSessionSavedLoginRoute, removeSessionSavedLoginRoute] = useSessionStorage({ key: SESSION_POST_LOGIN_REDIRECT_KEY });

    const goToLogin = useCallback(() => {
        setSessionSavedLoginRoute(window.location.pathname);
        navigate(DEFAULT_NO_AUTH_ROUTE);
    }, [navigate, setSessionSavedLoginRoute]);

    /**
     * Handles user login by setting user context and navigating to the appropriate page
     */
    const handleLogin = useCallback(
        (userId: UserId, trzAuthToken: string, provider: AuthProvider, providerAuthToken: string, preventNavigate?: boolean) => {
            if (!userId || !provider || !trzAuthToken) {
                notify(NoteType.GENERIC_ERROR, 'Invalid authentication parameters!');
                navigate('/');
                return;
            }

            // Save the provider auth token to local storage for future auto logins
            setLocalSavedAuthProvider(JSON.stringify({ provider, providerAuthToken }));

            // Set user data
            setAuthToken(trzAuthToken);
            setUserId(userId);

            // Once logged in, redirect to saved route or dashboard
            if (!preventNavigate) {
                removeSessionSavedLoginRoute();
                navigate(sessionSavedLoginRoute || DEFAULT_AUTHED_ROUTE, { replace: true });
            }
        },
        [navigate, sessionSavedLoginRoute, removeSessionSavedLoginRoute, setLocalSavedAuthProvider]
    );

    /**
     * Clears all user login data and navigates to the landing page.
     * Does not notify the server to invalidate sessions.
     */
    const clearLocalLoginData = useCallback(() => {
        // Clear saved auth provider
        removeLocalSavedAuthProvider();
        setAuthToken(undefined);
        setUserId(undefined);
        navigate('/');
    }, [navigate, removeLocalSavedAuthProvider]);

    /**
     * Development only login function to simulate user login
     */
    const devOnlyLogin = useCallback(
        async (username: string) => {
            if (!isDev()) {
                return;
            }
            const authSession = await callTrzApi(RestRoutes.USER_FAKE_DEV, { username }, undefined);
            if (!authSession) {
                throw new Error('Failed to login as user');
            }
            handleLogin(authSession.userId, authSession.authToken, AuthProvider.DEV, username);
        },
        [handleLogin]
    );

    const handleLoginFromProvider = useCallback(
        (providerData: AuthProviderCallbackBody) => {
            if (!userId || !authToken) {
                return;
            }
            const data: AuthProviderCallbackData = { ...providerData, auth: { userId, authToken } };
        },
        [userId, authToken]
    );

    /**
     * Try to automatically log the user in if we have saved auth provider data
     */
    useEffect(() => {
        let strictIgnore = false;
        const tryAutoLogin = async () => {
            if (strictIgnore) {
                return;
            }
            if (userId && authToken) {
                return;
            }
            if (!localSavedAuthProvider) {
                return;
            }
            let savedAuthProvider: AuthProviderToken;
            try {
                savedAuthProvider = JSON.parse(localSavedAuthProvider);
            } catch (e) {
                console.error('Failed to parse saved auth provider from local storage', e);
                return;
            }
            try {
                const loginData = await callTrzApi(RestRoutes.LOGIN_WITH_PROVIDER, {}, savedAuthProvider);
                if (!loginData) {
                    console.warn('Auto login with saved auth provider returned no data');
                    return;
                }
                handleLogin(loginData.userId, loginData.authToken, savedAuthProvider.provider, savedAuthProvider.providerAuthToken, true);
            } catch (e) {
                console.error('Auto login with saved auth provider failed', e);
            }
        };
        tryAutoLogin();
        return () => {
            strictIgnore = true;
        };
    }, [handleLogin, userId, authToken, localSavedAuthProvider, setSessionSavedLoginRoute]);

    return (
        <UserContext.Provider
            value={{
                userId,
                authToken,
                handleLogin,
                clearLocalLoginData,
                devLogin: devOnlyLogin,
                goToLogin,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

const useUserContext = () => {
    const context = React.useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};

export { UserProvider, useUserContext };
