import { Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { itemsToCommaSeparatedList } from '@trz/util/textUtils';
import React, { createContext, useCallback, useContext, useState } from 'react';

export enum Savable {
    RoleSettings = 'role settings',
    OrgSettings = 'organization settings',
    UserSettings = 'user settings',
}

export type UnsavedChangesContextType = {
    /** Array of unsaved change identifiers */
    getUnsavedChanges: () => Savable[];
    /** Check if a specific change is saved */
    isSaved: (id: Savable) => boolean;
    /** Marks a specific change as saved */
    markChangesSaved: (id: Savable) => void;
    /** Marks a specific change as unsaved */
    markChangesUnsaved: (id: Savable) => void;
    /** Marks all changes as saved */
    markAllChangesSaved: () => void;
    /** Sets the saved state for a specific change */
    setSavedState: (id: Savable, saved: boolean) => void;
    /** Prompts the user to confirm discarding unsaved changes. Returns true if the user confirms discarding changes, false otherwise. */
    confirmDiscardUnsavedChanges: () => Promise<boolean>;
    /** Prompts the user to confirm discarding unsaved changes. Returns false if the user confirms discarding changes, true otherwise. */
    confirmKeepUnsavedChanges: () => Promise<boolean>;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

const UnsavedChangesProvider: React.FC<any> = ({ children }) => {
    const [modalOpened, setModalOpened] = useState<boolean>(false);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);
    const [unsavedIds] = useState<Set<Savable>>(new Set());

    const getUnsavedChanges = useCallback(() => {
        return Array.from(unsavedIds);
    }, [unsavedIds]);

    const isSaved = useCallback(
        (id: Savable) => {
            return !unsavedIds.has(id);
        },
        [unsavedIds]
    );

    const markChangesSaved = useCallback((id: Savable) => {
        unsavedIds.delete(id);
    }, []);

    const markChangesUnsaved = useCallback((id: Savable) => {
        unsavedIds.add(id);
    }, []);

    const markAllChangesSaved = useCallback(() => {
        unsavedIds.clear();
    }, []);

    const setSavedState = useCallback((id: Savable, saved: boolean) => {
        if (saved) {
            unsavedIds.delete(id);
        } else {
            unsavedIds.add(id);
        }
    }, []);

    const confirmDiscardUnsavedChanges = useCallback(async () => {
        if (getUnsavedChanges().length > 0) {
            setModalOpened(true);
            return new Promise<boolean>((resolve) => {
                setResolvePromise(() => resolve);
            });
        }
        return true;
    }, [getUnsavedChanges]);

    const confirmKeepUnsavedChanges = useCallback(async () => {
        const discard = await confirmDiscardUnsavedChanges();
        return !discard;
    }, [confirmDiscardUnsavedChanges]);

    const handleCloseModal = useCallback(
        (discardChanges: boolean) => {
            setModalOpened(false);
            if (resolvePromise) {
                resolvePromise(discardChanges);
                setResolvePromise(null);
                if (discardChanges) {
                    markAllChangesSaved();
                }
            }
        },
        [resolvePromise, markAllChangesSaved]
    );

    const unsavedChanges = getUnsavedChanges();
    return (
        <UnsavedChangesContext.Provider
            value={{
                getUnsavedChanges,
                isSaved,
                markChangesSaved,
                markChangesUnsaved,
                markAllChangesSaved,
                setSavedState,
                confirmDiscardUnsavedChanges,
                confirmKeepUnsavedChanges,
            }}
        >
            <Modal
                opened={modalOpened}
                onClose={markAllChangesSaved}
                title={<Title order={4}>Unsaved Changes</Title>}
                centered
                withCloseButton={false}
            >
                <Stack>
                    <Text>
                        You have unsaved changes to <strong>{itemsToCommaSeparatedList(unsavedChanges)}</strong>.
                    </Text>
                    <Text>
                        Are you sure you want to discard {unsavedChanges.length === 1 ? 'this change' : 'these changes'}
                        ?
                    </Text>
                    <Group>
                        <Button
                            variant="outline"
                            onClick={() => {
                                markAllChangesSaved();
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
