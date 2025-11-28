import { isDev } from '@mosaiq/terrazzo-common/utils/envUtils';
import { lazy, Suspense } from 'react';

interface DevUserSwitcherMenuProps {}

const LazyDevUserSwitcherMenu = lazy(() =>
    import('./DO_NOT_IMPORT_devUserSwitcherMenu').then((module) => ({
        default: module.DO_NOT_IMPORT_DevUserSwitcherMenu,
    }))
);

export const DevUserSwitcherMenu = (props: DevUserSwitcherMenuProps): JSX.Element | null => {
    if (!isDev()) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <LazyDevUserSwitcherMenu {...props} />
        </Suspense>
    );
};
