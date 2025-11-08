import React, { useEffect, useMemo, useState } from 'react';
import { Box, Title, Stack, TextInput, Textarea, Group, Button, Divider, Space, Fieldset, Anchor, Text } from '@mantine/core';
import { Role } from '@mosaiq/terrazzo-common/constants';
import { DEFAULT_AUTHED_ROUTE } from '@trz/contexts/user-context';
import { notify, NoteType } from '@trz/util/notifications';
import { MembershipRecord, Organization, OrganizationHeader, OrganizationId } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { useNavigate } from 'react-router-dom';
import { revokeMembershipRecord, updateOrgField } from '@trz/emitters/all';

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

    const archivedProjects = useMemo(() => {
        return props.orgData.projects.filter((p) => p.archived);
    }, [props.orgData.projects]);

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
                        disabled={props.myMembershipRecord.userRole < Role.ADMIN}
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
                        disabled={props.myMembershipRecord.userRole < Role.ADMIN}
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
                        disabled={props.myMembershipRecord.userRole < Role.ADMIN}
                    />
                    <Group>
                        <Button
                            variant="outline"
                            disabled={props.myMembershipRecord.userRole < Role.ADMIN}
                            onClick={() => {
                                setEditedSettings(props.orgData ?? {});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            disabled={props.myMembershipRecord.userRole < Role.ADMIN}
                            onClick={async () => {
                                if (props.myMembershipRecord.userRole < Role.ADMIN) {
                                    notify(NoteType.UNAUTHORIZED);
                                    return;
                                }
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
                            disabled={props.myMembershipRecord.userRole >= Role.OWNER}
                            onClick={async () => {
                                if (props.myMembershipRecord.userRole >= Role.OWNER) {
                                    notify(NoteType.UNAUTHORIZED);
                                    return;
                                }
                                try {
                                    revokeMembershipRecord(sockCtx, props.myMembershipRecord.id);
                                    notify(NoteType.LEFT_ENTITY, [props.orgData.name]);
                                    navigate(DEFAULT_AUTHED_ROUTE);
                                } catch (e) {
                                    notify(NoteType.ORG_DATA_ERROR, e);
                                }
                            }}
                        >
                            Leave Organization
                        </Button>
                        <Button
                            variant="light"
                            color="red"
                            w="min-content"
                            disabled={props.myMembershipRecord.userRole < Role.OWNER}
                            onClick={async () => {
                                if (props.myMembershipRecord.userRole < Role.OWNER) {
                                    notify(NoteType.UNAUTHORIZED);
                                    return;
                                }
                                try {
                                    updateOrgField(sockCtx, props.orgData.id, { archived: true });
                                    notify(NoteType.CHANGES_SAVED);
                                    navigate(DEFAULT_AUTHED_ROUTE);
                                } catch (e) {
                                    notify(NoteType.ORG_DATA_ERROR, e);
                                }
                            }}
                        >
                            Archive Organization
                        </Button>
                    </Group>
                    <Fieldset
                        legend="Archive"
                        bg="transparent"
                    >
                        {archivedProjects.length === 0 ? (
                            <Text>Nothing archived yet!</Text>
                        ) : (
                            <Stack>
                                {archivedProjects.map((project) => (
                                    <Anchor
                                        key={project.id}
                                        href={`/project/${project.id}`}
                                    >
                                        {project.name}
                                    </Anchor>
                                ))}
                            </Stack>
                        )}
                    </Fieldset>
                </Stack>
            </Box>
        </Box>
    );
};
