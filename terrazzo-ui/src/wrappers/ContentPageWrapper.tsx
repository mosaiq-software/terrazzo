import { DashboardProvider } from '@trz/contexts/dashboard-context';
import { AuthWrapper } from '@trz/wrappers/authWrapper';
import TRZAppLayout from '@trz/wrappers/TRZAppLayout';
import { Outlet } from 'react-router';
const ContentPageWrapper = () => {
    return (
        <AuthWrapper>
            <DashboardProvider>
                <TRZAppLayout>
                    <Outlet />
                </TRZAppLayout>
            </DashboardProvider>
        </AuthWrapper>
    );
};

export default ContentPageWrapper;
