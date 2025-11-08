//Utility
import React from 'react';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-contextmenu/styles.layer.css';
import { Button, createTheme, MantineProvider } from '@mantine/core';
import { TRZProvider } from '@trz/contexts/TRZ-context';
import { SocketProvider } from '@trz/contexts/socket-context';
import { Notifications } from '@mantine/notifications';
import Router from './router';
import { UserProvider } from '@trz/contexts/user-context';
import { BrowserRouter } from 'react-router-dom';
import { ModalsProvider } from '@mantine/modals';
import { CreateBoardModal } from '@trz/components/Modals/CreateBoard';
import { CreateProjectModal } from '@trz/components/Modals/CreateProject';
import { CreateOrganizationModal } from '@trz/components/Modals/CreateOrganization';
import { ContextMenuProvider } from 'mantine-contextmenu';

const theme = createTheme({});

const modals = {
    organization: CreateOrganizationModal,
    project: CreateProjectModal,
    board: CreateBoardModal,
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
