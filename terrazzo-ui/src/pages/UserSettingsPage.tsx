import { Box, Button, Fieldset, Group, ScrollArea, Stack, TextInput, Title } from '@mantine/core';
import { fullName, UserHeader } from '@mosaiq/terrazzo-common';
import { ImageUpload } from '@trz/components/UI/ImageUpload';
import { NotFound, PageErrors } from '@trz/components/UI/NotFound';
import { useSocket } from '@trz/contexts/socket-context';
import { useUI } from '@trz/contexts/ui-context';
import { Savable, useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { updateUserField } from '@trz/emitters';
import { useMe } from '@trz/hooks/useMe';
import { NoteType, notify } from '@trz/util/notifications';
import { setTitle } from '@trz/util/tabUtils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const UserSettingsPage = (): React.JSX.Element => {
    const uiCtx = useUI();
    const me = useMe();
    const sockCtx = useSocket();
    const unsavedCtx = useUnsavedChanges();

    const [editedUserData, setEditedUserData] = useState<Partial<UserHeader>>({});

    const change = useCallback(<K extends keyof UserHeader>(field: K, value: UserHeader[K]) => {
        setEditedUserData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const isSaved = useMemo(() => {
        let saved = true;
        Object.keys(editedUserData).forEach((key) => {
            const k = key as keyof UserHeader;
            if (editedUserData[k] !== undefined && me && editedUserData[k] !== me[k]) {
                saved = false;
            }
        });
        return saved;
    }, [editedUserData, me]);

    useEffect(() => {
        unsavedCtx.setSavedState(Savable.UserSettings, isSaved);
    }, [isSaved]);

    const handleSave = useCallback(async () => {
        try {
            if (!me) {
                throw new Error('No user data available');
            }
            await updateUserField(sockCtx, { ...editedUserData, id: me.id });
            notify(NoteType.CHANGES_SAVED);
            setEditedUserData({});
        } catch (e) {
            notify(NoteType.GENERIC_ERROR, e);
        }
    }, [editedUserData, me, sockCtx]);

    useEffect(() => {
        setTitle(`My Settings | Terrazzo`);
    }, []);

    if (!me) {
        return (
            <NotFound
                itemType="user"
                error={PageErrors.FORBIDDEN}
            />
        );
    }

    return (
        <ScrollArea h={`calc(100vh - ${uiCtx.navbarHeight}px)`}>
            <Stack
                bg="#15161A"
                mih="100vh"
                pb="10vh"
                align="center"
            >
                <Box
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Stack
                        style={{
                            width: '40rem',
                            paddingTop: '2rem',
                        }}
                    >
                        <Group>
                            <Title order={2}>Settings for {fullName(me)}</Title>
                        </Group>
                        <Fieldset
                            legend="General"
                            bg="transparent"
                        >
                            <Stack gap={'lg'}>
                                <TextInput
                                    label="Username"
                                    value={editedUserData.username ?? me.username}
                                    onChange={(e) => change('username', e.target.value)}
                                    placeholder="Username"
                                />
                                <Group>
                                    <TextInput
                                        label="First Name"
                                        value={editedUserData.firstName ?? me.firstName}
                                        onChange={(e) => change('firstName', e.target.value)}
                                        placeholder="First Name"
                                        style={{ flex: 1 }}
                                    />
                                    <TextInput
                                        label="Last Name"
                                        value={editedUserData.lastName ?? me.lastName}
                                        onChange={(e) => change('lastName', e.target.value)}
                                        placeholder="Last Name"
                                        style={{ flex: 1 }}
                                    />
                                </Group>
                                <Group
                                    align="start"
                                    wrap="nowrap"
                                >
                                    <ImageUpload
                                        currentImageUrl={editedUserData.profilePicture ?? me.profilePicture}
                                        onUploadComplete={(url) => change('profilePicture', url)}
                                        width={100}
                                        height={100}
                                        alt="Profile Picture"
                                        style={{ width: 100, height: 100 }}
                                    />
                                    <TextInput
                                        label="Profile Picture URL"
                                        value={editedUserData.profilePicture ?? me.profilePicture}
                                        onChange={(e) => change('profilePicture', e.target.value)}
                                        placeholder="Profile Picture URL"
                                        style={{ flex: 1 }}
                                    />
                                </Group>
                                <Button
                                    disabled={isSaved}
                                    onClick={handleSave}
                                >
                                    Save
                                </Button>
                            </Stack>
                        </Fieldset>
                    </Stack>
                </Box>
            </Stack>
        </ScrollArea>
    );
};

export default UserSettingsPage;
