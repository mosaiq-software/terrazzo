import { Box, Button, Fieldset, Group, Loader, Menu, ScrollArea, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { fullName, generateUsernameDiscriminator, UserHeader } from '@mosaiq/terrazzo-common';
import { ImageUpload } from '@trz/components/UI/ImageUpload';
import { LinkedAccountRenderer } from '@trz/components/UI/LinkedAccountRenderer';
import { NotFound, PageErrors } from '@trz/components/UI/NotFound';
import { useSocket } from '@trz/contexts/socket-context';
import { useUI } from '@trz/contexts/ui-context';
import { Savable, useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { getUsernameAvailable, unlinkAccountFromUser, updateUserField } from '@trz/emitters';
import { useMe } from '@trz/hooks/useMe';
import { useUserLinkedAccounts } from '@trz/hooks/useUserLinkedAccounts';
import { COLORS } from '@trz/util/colors';
import { isDev } from '@trz/util/envUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { setTitle } from '@trz/util/tabUtils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BsGithub } from 'react-icons/bs';
import { FaCode } from 'react-icons/fa';
import { MdAdd } from 'react-icons/md';

const UserSettingsPage = (): React.JSX.Element => {
    const uiCtx = useUI();
    const me = useMe();
    const sockCtx = useSocket();
    const unsavedCtx = useUnsavedChanges();
    const linkedAccounts = useUserLinkedAccounts(me?.id);

    const [editedUserData, setEditedUserData] = useState<Partial<UserHeader>>({});
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | undefined>(undefined);

    const checkUsernameAvailability = useDebouncedCallback(async (username: string) => {
        const user = await getUsernameAvailable(sockCtx, username);
        setUsernameAvailable(user);
    }, 500);

    const change = useCallback(
        <K extends keyof UserHeader>(field: K, value: UserHeader[K]) => {
            setEditedUserData((prev) => ({
                ...prev,
                [field]: value,
            }));

            if (field === 'username') {
                setUsernameAvailable(undefined);
                checkUsernameAvailability(value);
            }
        },
        [checkUsernameAvailability]
    );

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
            if (usernameAvailable === false) {
                notify(NoteType.USER_CREATION_ERROR, 'Username is already taken');
                return;
            }
            await updateUserField(sockCtx, { ...editedUserData, id: me.id });
            notify(NoteType.CHANGES_SAVED);
            setEditedUserData({});
            setUsernameAvailable(undefined);
        } catch (e) {
            notify(NoteType.GENERIC_ERROR, e);
        }
    }, [editedUserData, me, sockCtx, usernameAvailable]);

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

    const randomDiscriminator = generateUsernameDiscriminator();

    return (
        <ScrollArea h={`calc(100vh - ${uiCtx.navbarHeight}px)`}>
            <Stack
                bg={COLORS.background.medium}
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
                            legend="Account"
                            bg={COLORS.transparent}
                        >
                            <Stack gap={'lg'}>
                                <TextInput
                                    label="Username"
                                    value={editedUserData.username ?? me.username}
                                    onChange={(e) => change('username', e.target.value)}
                                    placeholder="Username"
                                    error={
                                        usernameAvailable === false ? (
                                            <Stack gap={0}>
                                                <Text
                                                    c="unset"
                                                    fz="xs"
                                                >
                                                    Username is already taken.
                                                </Text>
                                                <Group gap={4}>
                                                    <Text
                                                        span
                                                        c={COLORS.text.muted}
                                                        fz="xs"
                                                    >
                                                        How about
                                                    </Text>
                                                    <Button
                                                        variant="subtle"
                                                        size="compact-xs"
                                                        p={0}
                                                        c={COLORS.text.muted}
                                                        fw="normal"
                                                        td="underline"
                                                        onClick={() => {
                                                            change(
                                                                'username',
                                                                `${editedUserData.username ?? me.username}${randomDiscriminator}`
                                                            );
                                                        }}
                                                    >
                                                        {`${editedUserData.username ?? me.username}${randomDiscriminator}`}
                                                    </Button>
                                                </Group>
                                            </Stack>
                                        ) : undefined
                                    }
                                    rightSection={
                                        usernameAvailable === undefined && !!editedUserData.username?.length ? (
                                            <Loader size="xs" />
                                        ) : null
                                    }
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
                                    disabled={isSaved || usernameAvailable === false}
                                    onClick={handleSave}
                                >
                                    Save
                                </Button>
                            </Stack>
                        </Fieldset>
                        <Fieldset
                            legend="Linked Accounts"
                            bg={COLORS.transparent}
                        >
                            <Stack gap={'lg'}>
                                {linkedAccounts.map((account) => (
                                    <LinkedAccountRenderer
                                        key={account.accountId}
                                        account={account}
                                        isOnlyAccount={linkedAccounts.length === 1}
                                        onUnlink={async (acc) => {
                                            try {
                                                await unlinkAccountFromUser(sockCtx, acc);
                                            } catch (e) {
                                                notify(NoteType.GENERIC_ERROR, e);
                                            }
                                        }}
                                    />
                                ))}
                                <Menu>
                                    <Menu.Target>
                                        <Button
                                            variant="subtle"
                                            leftSection={<MdAdd />}
                                        >
                                            Link New Account
                                        </Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        {isDev() && (
                                            <Menu.Item
                                                leftSection={<FaCode />}
                                                onClick={() => {
                                                    modals.openContextModal({
                                                        modal: 'linkDevAccount',
                                                        innerProps: {},
                                                    });
                                                }}
                                            >
                                                Link Dev Account (Dev Only)
                                            </Menu.Item>
                                        )}
                                        <Menu.Item
                                            leftSection={<BsGithub />}
                                            onClick={() => {
                                                modals.openContextModal({
                                                    modal: 'linkGithubAccount',
                                                    innerProps: {},
                                                });
                                            }}
                                        >
                                            Link Github Account
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Stack>
                        </Fieldset>
                    </Stack>
                </Box>
            </Stack>
        </ScrollArea>
    );
};

export default UserSettingsPage;
