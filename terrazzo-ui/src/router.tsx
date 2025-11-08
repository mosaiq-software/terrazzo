import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { GithubAuth } from '@trz/pages/auth/github';
import { SetUpAccount } from '@trz/pages/auth/SetUpAccount';
import ContentPageWrapper from '@trz/wrappers/ContentPageWrapper';
import LandingPage from '@trz/pages/LandingPage';
import HomePage from '@trz/pages/HomePage';
import OrganizationPage from '@trz/pages/OrganizationPage';
import ProjectPage from '@trz/pages/ProjectPage';
import BoardPage from '@trz/pages/BoardPage';
import BoardSettingsPage from '@trz/pages/BoardSettingsPage';
import UserSettingsPage from '@trz/pages/UserSettingsPage';
import LoginPage from '@trz/pages/auth/LoginPage';
import { NotFound, PageErrors } from './components/NotFound';
import DocumentPage from './pages/DocumentPage';

const Router = () => {
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
                path="/auth"
                element={<Outlet />}
            >
                <Route
                    path="github"
                    element={<GithubAuth />}
                />
            </Route>
            <Route
                path="/create-account"
                element={<SetUpAccount />}
            />
            <Route element={<ContentPageWrapper />}>
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
                    path="/board/:boardId/settings"
                    element={<BoardSettingsPage />}
                />
                <Route
                    path="/project/:projectId/:tabId?"
                    element={<ProjectPage />}
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
