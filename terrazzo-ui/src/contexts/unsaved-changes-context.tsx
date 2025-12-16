import { Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { itemsToCommaSeparatedList } from '@trz/util/textUtils';
import React, { createContext, useCallback, useContext, useState } from 'react';

export enum Savable {
    RoleSettings = 'role settings',
}

export type UnsavedChangesContextType = {
    /** Array of unsaved change identifiers */
    unsavedChanges: Savable[];
    /** Marks a specific change as saved */
    markChangesSaved: (id: Savable) => void;
    /** Marks a specific change as unsaved */
    markChangesUnsaved: (id: Savable) => void;
    /** Marks all changes as saved */
    markAllChangesSaved: () => void;
    /** Prompts the user to confirm discarding unsaved changes. Returns true if the user confirms discarding changes, false otherwise. */
    confirmDiscardUnsavedChanges: () => Promise<boolean>;
    /** Prompts the user to confirm discarding unsaved changes. Returns false if the user confirms discarding changes, true otherwise. */
    confirmKeepUnsavedChanges: () => Promise<boolean>;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

const UnsavedChangesProvider: React.FC<any> = ({ children }) => {
    const [modalOpened, setModalOpened] = useState<boolean>(false);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);
    const [unsavedIds, setUnsavedIds] = useState<Set<Savable>>(new Set());

    const unsavedChanges = Array.from(unsavedIds);
    const existsUnsavedChanges = unsavedChanges.length > 0;

    const markChangesSaved = useCallback((id: Savable) => {
        setUnsavedIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    }, []);

    const markChangesUnsaved = useCallback((id: Savable) => {
        setUnsavedIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
        });
    }, []);

    const markAllChangesSaved = useCallback(() => {
        setUnsavedIds(new Set());
    }, []);

    const confirmDiscardUnsavedChanges = useCallback(async () => {
        if (existsUnsavedChanges) {
            setModalOpened(true);
            return new Promise<boolean>((resolve) => {
                setResolvePromise(() => resolve);
            });
        }
        return true;
    }, [existsUnsavedChanges]);

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

    return (
        <UnsavedChangesContext.Provider
            value={{
                unsavedChanges,
                markChangesSaved,
                markChangesUnsaved,
                markAllChangesSaved,
                confirmDiscardUnsavedChanges,
                confirmKeepUnsavedChanges,
            }}
        >
            <Modal
                opened={modalOpened}
                onClose={markAllChangesSaved}
                title={<Title order={4}>Unsaved Changes</Title>}
                centered
            >
                <Stack>
                    <Text>
                        You have unsaved changes to <strong>{itemsToCommaSeparatedList(unsavedChanges)}</strong>.
                    </Text>
                    <Text>Are you sure you want to discard {unsavedChanges.length === 1 ? 'this change' : 'these changes'}?</Text>
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
