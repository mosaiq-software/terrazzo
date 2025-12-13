import { Box, Button, Divider, Group, Space, Stack, TextInput, Textarea, Title } from '@mantine/core';
import { MembershipRecord, OrganizationHeader, PermissibleAction } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { DEFAULT_AUTHED_ROUTE } from '@trz/contexts/user-context';
import { removeUserFromOrg, updateOrgField } from '@trz/emitters';
import { useOrgPermission } from '@trz/hooks/usePermissions';
import { COLOR_UNSET } from '@trz/util/colorUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RectHoldingButton } from '../UI/RectHoldingButton';

interface OrgTabSettingsProps {
    myMembershipRecord: MembershipRecord;
    orgData: OrganizationHeader;
}
export const OrgTabSettings = (props: OrgTabSettingsProps) => {
    const [editedSettings, setEditedSettings] = useState<Partial<OrganizationHeader>>({});
    const userCanAdmin = useOrgPermission(props.orgData.id, PermissibleAction.AdministerOrg);
    const sockCtx = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (props.orgData) setEditedSettings(props.orgData);
    }, [props.orgData]);

    const iAmOwner = useMemo(() => {
        return props.myMembershipRecord.userId === props.orgData.ownerId;
    }, [props.myMembershipRecord, props.orgData]);

    const handleLeaveOrg = useCallback(async () => {
        try {
            if (iAmOwner) {
                throw new Error('Organization owners cannot leave their own organization. Please transfer ownership first.');
            }
            await removeUserFromOrg(sockCtx, props.myMembershipRecord.userId, props.orgData.id);
            notify(NoteType.LEFT_ENTITY, [props.orgData.name]);
            navigate(DEFAULT_AUTHED_ROUTE);
        } catch (e) {
            notify(NoteType.ORG_DATA_ERROR, e);
        }
    }, [sockCtx, props.myMembershipRecord, props.orgData, navigate, iAmOwner]);

    const handleSaveChanges = useCallback(async () => {
        try {
            if (!userCanAdmin) {
                throw new Error('You do not have permission to administer this organization.');
            }
            await updateOrgField(sockCtx, props.orgData.id, editedSettings);
            notify(NoteType.CHANGES_SAVED);
        } catch (e) {
            notify(NoteType.ORG_DATA_ERROR, e);
        }
    }, [sockCtx, props.orgData, editedSettings, userCanAdmin]);

    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                width: '100%',
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
                        disabled={!userCanAdmin}
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
                        disabled={!userCanAdmin}
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
                        disabled={!userCanAdmin}
                    />
                    <Group>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditedSettings(props.orgData ?? {});
                            }}
                            disabled={!userCanAdmin}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            onClick={handleSaveChanges}
                            disabled={!userCanAdmin}
                        >
                            Save
                        </Button>
                    </Group>
                    <Divider />
                    <Space />
                    <Group gap="sm">
                        <RectHoldingButton
                            onClick={handleLeaveOrg}
                            durationMs={5000}
                            tooltip={iAmOwner ? 'Organization owners cannot leave their own organization. Please transfer ownership first.' : 'Hold to leave this organization'}
                            disabled={iAmOwner}
                            borderColor={'red'}
                            defaultBorderColor={COLOR_UNSET}
                        >
                            Hold to Leave Organization
                        </RectHoldingButton>
                    </Group>
                </Stack>
            </Box>
        </Box>
    );
};
