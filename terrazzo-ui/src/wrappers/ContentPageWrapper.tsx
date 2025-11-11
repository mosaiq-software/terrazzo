import { AuthWrapper } from '@trz/wrappers/authWrapper';
import TRZAppLayout from '@trz/wrappers/TRZAppLayout';
import { Outlet } from 'react-router';
const ContentPageWrapper = () => {
    return (
        <AuthWrapper>
            <TRZAppLayout>
                <Outlet />
            </TRZAppLayout>
        </AuthWrapper>
    );
};

export default ContentPageWrapper;
