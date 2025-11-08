import React from 'react';
import { AuthWrapper } from '@trz/wrappers/authWrapper';
import { Outlet } from 'react-router';
import TRZAppLayout from '@trz/wrappers/TRZAppLayout';
import { DashboardProvider } from '@trz/contexts/dashboard-context';
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
