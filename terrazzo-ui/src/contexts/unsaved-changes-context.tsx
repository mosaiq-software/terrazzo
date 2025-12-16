import { Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import React, { createContext, useContext, useState } from 'react';

export type UnsavedChangesContextType = {
    /** Does the user have any piece of unsaved data */
    unsavedChanges: boolean;
    /** Marks all changes as saved */
    markChangesSaved: () => void;
    /** Marks all changes as unsaved */
    markChangesUnsaved: () => void;
    /** Prompts the user to confirm discarding unsaved changes. Returns true if the user confirms discarding changes, false otherwise. */
    confirmDiscardUnsavedChanges: () => Promise<boolean>;
    /** Prompts the user to confirm discarding unsaved changes. Returns false if the user confirms discarding changes, true otherwise. */
    confirmKeepUnsavedChanges: () => Promise<boolean>;
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

    const confirmKeepUnsavedChanges = async () => {
        const discard = await confirmDiscardUnsavedChanges();
        return !discard;
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
                confirmKeepUnsavedChanges,
            }}
        >
            <Modal
                opened={modalOpened}
                onClose={() => setUnsavedChanges(false)}
                title={<Title order={4}>Unsaved Changes</Title>}
                centered
            >
                <Stack>
                    <Text>Are you sure you want to discard your unsaved changes?</Text>
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
