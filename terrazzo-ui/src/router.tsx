import { GithubAuth } from '@trz/pages/auth/github';
import LoginPage from '@trz/pages/auth/LoginPage';
import BoardPage from '@trz/pages/BoardPage';
import HomePage from '@trz/pages/HomePage';
import LandingPage from '@trz/pages/LandingPage';
import OrganizationPage from '@trz/pages/OrganizationPage';
import UserSettingsPage from '@trz/pages/UserSettingsPage';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout/AppLayout';
import { NotFound, PageErrors } from './components/UI/NotFound';
import DocumentPage from './pages/DocumentPage';
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
                path="/auth/github"
                element={<GithubAuth />}
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
            <Route path="/view">
                <Route
                    path="card/:cardId"
                    element={<BoardPage viewOnly />}
                />
                <Route
                    path="board/:boardId"
                    element={<BoardPage viewOnly />}
                />
                <Route
                    path="doc/:documentId"
                    element={<DocumentPage viewOnly />}
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
