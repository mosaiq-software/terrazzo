import { Box, Button, Fieldset, Group, ScrollArea, Stack, Title } from '@mantine/core';
import { fullName, UserHeader } from '@mosaiq/terrazzo-common';
import EditableTextbox from '@trz/components/UI/EditableTextbox';
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

    const handleSave = useCallback(
        async (changes: Partial<UserHeader>) => {
            try {
                if (!me) {
                    throw new Error('No user data available');
                }
                await updateUserField(sockCtx, { ...changes, id: me.id });
                notify(NoteType.CHANGES_SAVED);
            } catch (e) {
                notify(NoteType.GENERIC_ERROR, e);
            }
        },
        [me, sockCtx]
    );

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
                            <Stack>
                                <EditableTextbox
                                    value={editedUserData.username ?? me.username}
                                    onChange={(val) => change('username', val)}
                                    placeholder="Username"
                                    type="title"
                                    titleProps={{
                                        order: 3,
                                    }}
                                    style={{ flex: 1 }}
                                />
                                <Group>
                                    <EditableTextbox
                                        value={editedUserData.firstName ?? me.firstName}
                                        onChange={(val) => change('firstName', val)}
                                        placeholder="First Name"
                                        style={{ flex: 1 }}
                                    />
                                    <EditableTextbox
                                        value={editedUserData.lastName ?? me.lastName}
                                        onChange={(val) => change('lastName', val)}
                                        placeholder="Last Name"
                                        style={{ flex: 1 }}
                                    />
                                </Group>
                                <Group>
                                    <ImageUpload
                                        currentImageUrl={editedUserData.profilePicture ?? me.profilePicture}
                                        onUploadComplete={(url) => handleSave({ profilePicture: url })}
                                        width={100}
                                        height={100}
                                        alt="Profile Picture"
                                    />
                                    <EditableTextbox
                                        value={editedUserData.profilePicture ?? me.profilePicture}
                                        onChange={(val) => change('profilePicture', val)}
                                        placeholder="Profile Picture URL"
                                        style={{ flex: 1 }}
                                    />
                                </Group>
                                <Button
                                    disabled={isSaved}
                                    onClick={() => {
                                        handleSave(editedUserData);
                                        setEditedUserData({});
                                    }}
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
