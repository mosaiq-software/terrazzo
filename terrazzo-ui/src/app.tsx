//Utility
import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { CreateBoardModal } from '@trz/components/Modals/CreateBoard';
import { CreateOrganizationModal } from '@trz/components/Modals/CreateOrganization';
import { TRZProvider } from '@trz/contexts/TRZ-context';
import { SocketProvider } from '@trz/contexts/socket-context';
import { UserProvider } from '@trz/contexts/user-context';
import { ContextMenuProvider } from 'mantine-contextmenu';
import 'mantine-contextmenu/styles.layer.css';
import { BrowserRouter } from 'react-router-dom';
import { ModuleSettingsModal } from './components/ModuleSettings/ModuleSettingsModal';
import Router from './router';
import { JoinOrganizationModal } from './components/Modals/JoinOrganization';

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
                        <TRZProvider>
                            <ModalsProvider modals={modals}>
                                <ContextMenuProvider>
                                    <Router />
                                </ContextMenuProvider>
                            </ModalsProvider>
                        </TRZProvider>
                    </SocketProvider>
                </UserProvider>
            </BrowserRouter>
        </MantineProvider>
    );
};

export default App;
