import { Button, Group, Modal, Stack, Title } from '@mantine/core';
import React, { createContext, useContext, useState } from 'react';

export type UnsavedChangesContextType = {
    unsavedChanges: boolean;
    markChangesSaved: () => void;
    markChangesUnsaved: () => void;
    confirmDiscardUnsavedChanges: () => Promise<boolean>;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

const UnsavedChangesProvider: React.FC<any> = ({ children }) => {
    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
    const [modalOpened, setModalOpened] = useState<boolean>(false);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirmDiscardUnsavedChanges = async () => {
        if (unsavedChanges) {
            setModalOpened(true);
            return new Promise<boolean>((resolve) => {
                setResolvePromise(() => resolve);
            });
        }
        return true;
    };

    const handleCloseModal = (discardChanges: boolean) => {
        setModalOpened(false);
        if (resolvePromise) {
            resolvePromise(discardChanges);
            setResolvePromise(null);
            if (discardChanges) {
                setUnsavedChanges(false);
            }
        }
    };

    return (
        <UnsavedChangesContext.Provider
            value={{
                unsavedChanges,
                markChangesSaved: () => setUnsavedChanges(false),
                markChangesUnsaved: () => setUnsavedChanges(true),
                confirmDiscardUnsavedChanges,
            }}
        >
            <Modal
                opened={modalOpened}
                onClose={() => setUnsavedChanges(false)}
                title="You have unsaved changes"
                centered
            >
                <Stack>
                    <Title order={4}> You have unsaved changes. </Title>
                    <Group>
                        <Button
                            variant="outline"
                            onClick={() => {
                                handleCloseModal(true);
                            }}
                        >
                            Discard Changes
                        </Button>
                        <Button
                            variant="filled"
                            onClick={() => {
                                handleCloseModal(false);
                            }}
                        >
                            Continue Editing
                        </Button>
                    </Group>
                </Stack>
            </Modal>
            {children}
        </UnsavedChangesContext.Provider>
    );
};

const useUnsavedChanges = () => {
    const context = useContext(UnsavedChangesContext);
    if (context === undefined) {
        throw new Error('useUnsavedChanges must be used within a UnsavedChangesProvider');
    }
    return context;
};

export { UnsavedChangesProvider, useUnsavedChanges };
