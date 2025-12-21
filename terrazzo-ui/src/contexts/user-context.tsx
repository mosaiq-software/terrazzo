import { useLocalStorage, useSessionStorage } from '@mantine/hooks';
import { AuthProviderCallbackBody, AuthProviderCallbackData, ExistingAuthToken, RestRoutes, UserId, UserIdWithAuth } from '@mosaiq/terrazzo-common';
import { callTrzApi } from '@trz/util/apiUtils';
import { isDev } from '@trz/util/envUtils';
import { NoteType, notify } from '@trz/util/notifications';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type UserContextType = {
    userId: UserId | undefined;
    authToken: string | undefined;
    clearLocalLoginData: () => void;
    devLogin: (username: string) => Promise<void>;
    goToLogin: () => void;
    saveCurrentRouteForPostLogin: () => void;
    handleLoginFromProvider: (providerData: AuthProviderCallbackBody) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_AUTHED_ROUTE = '/dashboard';
const DEFAULT_NO_AUTH_ROUTE = '/login';
const SESSION_POST_LOGIN_REDIRECT_KEY = 'login-route-destination';
const LOCAL_SAVED_AUTH_KEY = 'saved-auth-provider';

const UserProvider: React.FC<any> = ({ children }) => {
    const [userId, setUserId] = useState<UserId | undefined>(undefined);
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);
    const navigate = useNavigate();
    const [localSavedAuth, setLocalSavedAuth, removeLocalSavedAuth] = useLocalStorage({ key: LOCAL_SAVED_AUTH_KEY });
    const [sessionSavedLoginRoute, setSessionSavedLoginRoute, removeSessionSavedLoginRoute] = useSessionStorage({ key: SESSION_POST_LOGIN_REDIRECT_KEY });

    /**
     * Saves the current route to session storage for redirecting post-login
     */
    const saveCurrentRouteForPostLogin = useCallback(() => {
        setSessionSavedLoginRoute(window.location.pathname);
    }, [setSessionSavedLoginRoute]);

    /**
     * Navigates the user to the login page after saving the current route
     */
    const goToLogin = useCallback(() => {
        saveCurrentRouteForPostLogin();
        navigate(DEFAULT_NO_AUTH_ROUTE);
    }, [navigate, saveCurrentRouteForPostLogin]);

    /**
     * Handles user login by setting user context and navigating to the appropriate page
     */
    const handleLocallySaveAuth = useCallback(
        (userId: UserId, trzAuthToken: string) => {
            const existingAuth: ExistingAuthToken = { userId, trzAuthToken };
            setLocalSavedAuth(JSON.stringify(existingAuth));
            setAuthToken(trzAuthToken);
            setUserId(userId);
        },
        [setLocalSavedAuth]
    );

    /**
     * Navigates the user to the saved post-login route or default authenticated route
     */
    const handleNavigatePostLogin = useCallback(
        (fallbackRoute?: string) => {
            removeSessionSavedLoginRoute();
            navigate(sessionSavedLoginRoute || fallbackRoute || DEFAULT_AUTHED_ROUTE, { replace: true });
        },
        [navigate, removeSessionSavedLoginRoute, sessionSavedLoginRoute]
    );

    /**
     * Clears all user login data and navigates to the landing page.
     * Does not notify the server to invalidate sessions.
     */
    const clearLocalLoginData = useCallback(() => {
        // Clear saved auth provider
        removeLocalSavedAuth();
        setAuthToken(undefined);
        setUserId(undefined);
    }, [removeLocalSavedAuth]);

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
            handleLocallySaveAuth(authSession.userId, authSession.authToken);
            handleNavigatePostLogin();
        },
        [handleLocallySaveAuth]
    );

    const handleLoginFromProvider = useCallback(
        async (providerData: AuthProviderCallbackBody) => {
            const authObject: UserIdWithAuth | undefined = userId && authToken ? { userId, authToken } : undefined;
            const data: AuthProviderCallbackData = { ...providerData, auth: authObject };
            try {
                const session = await callTrzApi(RestRoutes.AUTH_PROVIDER_CALLBACK, {}, data);
                if (!session) {
                    throw new Error('No auth session returned from provider callback');
                }
                if (session === 'already-linked') {
                    notify(NoteType.UNAUTHORIZED, 'This authentication method is already linked to another account.');
                    return;
                }
                if (!authObject) {
                    handleLocallySaveAuth(session.userId, session.authToken);
                }
                handleNavigatePostLogin();
            } catch (error) {
                console.error('Error during auth provider callback:', error);
                notify(NoteType.GENERIC_ERROR, 'Authentication failed. Please try again.');
            }
        },
        [userId, authToken, handleLocallySaveAuth, navigate, handleNavigatePostLogin]
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
            if (!localSavedAuth) {
                return;
            }
            let savedAuth: ExistingAuthToken;
            try {
                savedAuth = JSON.parse(localSavedAuth);
            } catch (e) {
                console.error('Failed to parse saved auth provider from local storage', e);
                return;
            }
            try {
                const existingAuthResponse = await callTrzApi(RestRoutes.EXISTING_AUTH, {}, savedAuth);
                if (!existingAuthResponse) {
                    notify(NoteType.GENERIC_ERROR, 'Auto login with saved auth provider failed. Please log in again.');
                    return;
                }
                if (existingAuthResponse === 'unauthorized') {
                    notify(NoteType.GENERIC_ERROR, 'Saved authentication is no longer valid. Please log in again.');
                    clearLocalLoginData();
                    return;
                }
                handleLocallySaveAuth(existingAuthResponse.userId, existingAuthResponse.authToken);
            } catch (e) {
                console.error('Auto login with saved auth provider failed', e);
            }
        };
        tryAutoLogin();
        return () => {
            strictIgnore = true;
        };
    }, [handleLocallySaveAuth, userId, authToken, localSavedAuth, setSessionSavedLoginRoute, clearLocalLoginData]);

    return (
        <UserContext.Provider
            value={{
                userId,
                authToken,
                clearLocalLoginData,
                devLogin: devOnlyLogin,
                goToLogin,
                handleLoginFromProvider,
                saveCurrentRouteForPostLogin,
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
