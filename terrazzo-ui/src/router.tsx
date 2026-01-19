import { Stack, Text, Title } from '@mantine/core';
import LoginPage from '@trz/pages/auth/LoginPage';
import BoardPage from '@trz/pages/BoardPage';
import HomePage from '@trz/pages/HomePage';
import LandingPage from '@trz/pages/LandingPage';
import OrganizationPage from '@trz/pages/OrganizationPage';
import UserSettingsPage from '@trz/pages/UserSettingsPage';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout/AppLayout';
import { NotFound, PageErrors } from './components/UI/NotFound';
import { GithubAuthHandler } from './pages/auth/GithubAuthHandler';
import DocumentPage from './pages/DocumentPage';
import InvitePage from './pages/InvitePage';
import { useIsMobile } from './hooks/useIsMobile';

const Router = () => {
    const isMobile = useIsMobile();
    if (isMobile) {
        return (
            <Stack
                align="center"
                w="100%"
                h="100vh"
                justify="center"
                p="md"
                maw={400}
            >
                <Title
                    fz="10rem"
                    mb="md"
                >
                    {':('}
                </Title>
                <Text
                    ta="center"
                    size="lg"
                >
                    Terrazzo is not yet supported on mobile devices. Please access Terrazzo from a desktop or laptop
                    computer.
                </Text>
            </Stack>
        );
    }
    return (
        <Routes>
            <Route
                path="/"
                element={<LandingPage />}
            />
            <Route
                path="/login"
                element={<LoginPage />}
            />
            <Route
                path="/auth/github"
                element={<GithubAuthHandler />}
            />
            <Route
                path="/invite/:inviteId"
                element={<InvitePage />}
            />
            <Route element={<AppLayout />}>
                <Route
                    path="/dashboard"
                    element={<HomePage />}
                />
                <Route
                    path="/board/:boardId/"
                    element={<BoardPage />}
                />
                <Route
                    path="/card/:cardId"
                    element={<BoardPage />}
                />
                <Route
                    path="/org/:orgId/:tabId?"
                    element={<OrganizationPage />}
                />
                <Route
                    path="/doc/:documentId"
                    element={<DocumentPage />}
                />
                <Route
                    path="/settings"
                    element={<UserSettingsPage />}
                />
            </Route>

            {/* A catch-all route to redirect to the error page */}
            <Route
                path="*"
                element={
                    <NotFound
                        error={PageErrors.NOT_FOUND}
                        itemType="page"
                    />
                }
            />
        </Routes>
    );
};

export default Router;
