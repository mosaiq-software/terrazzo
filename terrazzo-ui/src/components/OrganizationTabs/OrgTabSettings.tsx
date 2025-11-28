import { Box, Button, Divider, Group, Space, Stack, TextInput, Textarea, Title } from '@mantine/core';
import { MembershipRecord, Organization, OrganizationHeader } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { DEFAULT_AUTHED_ROUTE } from '@trz/contexts/user-context';
import { removeUserFromOrg, updateOrgField } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OrgTabSettingsProps {
    myMembershipRecord: MembershipRecord;
    orgData: Organization;
}
export const OrgTabSettings = (props: OrgTabSettingsProps) => {
    const [editedSettings, setEditedSettings] = useState<Partial<OrganizationHeader>>({});
    const sockCtx = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (props.orgData) setEditedSettings(props.orgData);
    }, [props.orgData]);

    return (
        <Box
            style={{
                width: '80%',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            }}
        >
            <Title
                c="white"
                pb="20"
                order={4}
                maw="200"
            >
                Settings
            </Title>
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
                    }}
                >
                    <TextInput
                        labelProps={{
                            c: 'white',
                        }}
                        label="Organization Name"
                        placeholder="My Organization"
                        value={editedSettings.name ?? ''}
                        onChange={(e) => {
                            setEditedSettings({ ...editedSettings, name: e.target.value });
                        }}
                    />
                    <Textarea
                        labelProps={{
                            c: 'white',
                        }}
                        label="Organization Description"
                        placeholder="Write some info about your organization"
                        value={editedSettings.description ?? ''}
                        onChange={(e) => {
                            setEditedSettings({ ...editedSettings, description: e.target.value });
                        }}
                    />
                    <TextInput
                        labelProps={{
                            c: 'white',
                        }}
                        label="Organization Logo URL"
                        placeholder="https://mosaiq.dev/logo.png"
                        value={editedSettings.logoUrl ?? ''}
                        onChange={(e) => {
                            setEditedSettings({ ...editedSettings, logoUrl: e.target.value });
                        }}
                    />
                    <Group>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditedSettings(props.orgData ?? {});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            onClick={async () => {
                                try {
                                    updateOrgField(sockCtx, props.orgData.id, editedSettings);
                                    notify(NoteType.CHANGES_SAVED);
                                } catch (e) {
                                    notify(NoteType.ORG_DATA_ERROR, e);
                                }
                            }}
                        >
                            Save
                        </Button>
                    </Group>
                    <Divider />
                    <Space />
                    <Group gap="sm">
                        <Button
                            variant="light"
                            color="red"
                            w="min-content"
                            onClick={async () => {
                                try {
                                    await removeUserFromOrg(sockCtx, props.myMembershipRecord.userId, props.orgData.id);
                                    notify(NoteType.LEFT_ENTITY, [props.orgData.name]);
                                    navigate(DEFAULT_AUTHED_ROUTE);
                                } catch (e) {
                                    notify(NoteType.ORG_DATA_ERROR, e);
                                }
                            }}
                        >
                            Leave Organization
                        </Button>
                    </Group>
                </Stack>
            </Box>
        </Box>
    );
};
