import { GithubAuth } from '@trz/pages/auth/github';
import LoginPage from '@trz/pages/auth/LoginPage';
import { SetUpAccount } from '@trz/pages/auth/SetUpAccount';
import BoardPage from '@trz/pages/BoardPage';
import HomePage from '@trz/pages/HomePage';
import LandingPage from '@trz/pages/LandingPage';
import OrganizationPage from '@trz/pages/OrganizationPage';
import UserSettingsPage from '@trz/pages/UserSettingsPage';
import { Outlet, Route, Routes } from 'react-router-dom';
import { NotFound, PageErrors } from './components/NotFound';
import DocumentPage from './pages/DocumentPage';
import { AuthWrapper } from './wrappers/authWrapper';
import TRZAppLayout from './wrappers/TRZAppLayout';
import InvitePage from './pages/InvitePage';

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
            <Route element={<AuthWrapper />}>
                <Route
                    path="/invite/:inviteId"
                    element={<InvitePage />}
                />
                <Route element={<TRZAppLayout />}>
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
