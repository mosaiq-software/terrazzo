import { Anchor, Box, Button, Divider, Fieldset, Group, Space, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { Role } from '@mosaiq/terrazzo-common/constants';
import { MembershipRecord, Project, ProjectHeader } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { DEFAULT_AUTHED_ROUTE } from '@trz/contexts/user-context';
import { revokeMembershipRecord, updateProjectField } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProjectTabSettingsProps {
    myMembershipRecord: MembershipRecord;
    projectData: Project;
}
export const ProjectTabSettings = (props: ProjectTabSettingsProps) => {
    const [editedSettings, setEditedSettings] = useState<Partial<ProjectHeader>>({});
    const sockCtx = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (props.projectData) setEditedSettings(props.projectData);
    }, [props.projectData]);

    const archivedBoards = useMemo(() => {
        return props.projectData.boards.filter((b) => b.archived);
    }, [props.projectData.boards]);

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
                        label="Project Name"
                        placeholder="My Project"
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
                        label="Project Description"
                        placeholder="Write some info about your project"
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
                        label="Project Logo URL"
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
                                setEditedSettings(props.projectData ?? {});
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
                                    updateProjectField(sockCtx, props.projectData.id, editedSettings);
                                    notify(NoteType.CHANGES_SAVED);
                                } catch (e) {
                                    notify(NoteType.PROJECT_DATA_ERROR, e);
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
                                    notify(NoteType.LEFT_ENTITY, [props.projectData.name]);
                                    navigate(DEFAULT_AUTHED_ROUTE);
                                } catch (e) {
                                    notify(NoteType.PROJECT_DATA_ERROR, e);
                                }
                            }}
                        >
                            Leave Project
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
                                    updateProjectField(sockCtx, props.projectData.id, { archived: true });
                                    notify(NoteType.CHANGES_SAVED);
                                    navigate(DEFAULT_AUTHED_ROUTE);
                                } catch (e) {
                                    notify(NoteType.PROJECT_DATA_ERROR, e);
                                }
                            }}
                        >
                            Archive Project
                        </Button>
                    </Group>
                    <Fieldset
                        legend="Archive"
                        bg="transparent"
                    >
                        {archivedBoards.length === 0 ? (
                            <Text>Nothing archived yet!</Text>
                        ) : (
                            <Stack>
                                {archivedBoards.map((board) => (
                                    <Anchor
                                        key={board.id}
                                        href={`/board/${board.id}/settings`}
                                    >
                                        {board.name}
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
