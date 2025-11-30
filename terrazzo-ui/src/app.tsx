//Utility
import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { CreateBoardModal } from '@trz/components/Modals/CreateBoard';
import { CreateOrganizationModal } from '@trz/components/Modals/CreateOrganization';
import { SocketProvider } from '@trz/contexts/socket-context';
import { UserProvider } from '@trz/contexts/user-context';
import { ContextMenuProvider } from 'mantine-contextmenu';
import 'mantine-contextmenu/styles.layer.css';
import { BrowserRouter } from 'react-router-dom';
import { JoinOrganizationModal } from './components/Modals/JoinOrganization';
import { ModuleSettingsModal } from './components/ModuleSettings/ModuleSettingsModal';
import { OrgProvider } from './contexts/org-context';
import { UiProvider } from './contexts/ui-context';
import Router from './router';
import { UserDirectoryProvider } from './contexts/user-directory-context';

const theme = createTheme({});

const modals = {
    organization: CreateOrganizationModal,
    board: CreateBoardModal,
    moduleSettings: ModuleSettingsModal,
    joinOrganization: JoinOrganizationModal,
};

const App = () => {
    return (
        <MantineProvider
            theme={theme}
            forceColorScheme="dark"
        >
            <BrowserRouter>
                <Notifications />
                <UserProvider>
                    <SocketProvider>
                        <UiProvider>
                            <OrgProvider>
                                <UserDirectoryProvider>
                                    <ModalsProvider modals={modals}>
                                        <ContextMenuProvider>
                                            <Router />
                                        </ContextMenuProvider>
                                    </ModalsProvider>
                                </UserDirectoryProvider>
                            </OrgProvider>
                        </UiProvider>
                    </SocketProvider>
                </UserProvider>
            </BrowserRouter>
        </MantineProvider>
    );
};

export default App;
