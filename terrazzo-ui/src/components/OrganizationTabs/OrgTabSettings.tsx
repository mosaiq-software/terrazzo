import { Box, Button, Divider, Group, Space, Stack, TextInput, Textarea } from '@mantine/core';
import { modals } from '@mantine/modals';
import { MembershipRecord, OrganizationHeader, PermissibleAction } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { Savable, useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { removeUserFromOrg, updateOrgField } from '@trz/emitters';
import { useOrgPermission } from '@trz/hooks/usePermissions';
import { COLORS } from '@trz/util/colors';
import { NoteType, notify } from '@trz/util/notifications';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '../UI/ImageUpload';
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
    const unsavedCtx = useUnsavedChanges();

    const iAmOwner = useMemo(() => {
        return props.myMembershipRecord.userId === props.orgData.ownerId;
    }, [props.myMembershipRecord, props.orgData]);

    const handleLeaveOrg = useCallback(async () => {
        try {
            if (iAmOwner) {
                throw new Error(
                    'Organization owners cannot leave their own organization. Please transfer ownership first.'
                );
            }
            await removeUserFromOrg(sockCtx, props.myMembershipRecord.userId, props.orgData.id);
            notify(NoteType.LEFT_ENTITY, [props.orgData.name]);
            unsavedCtx.markChangesSaved(Savable.OrgSettings);
            navigate('/dashboard');
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
            unsavedCtx.markChangesSaved(Savable.OrgSettings);
            setEditedSettings({});
        } catch (e) {
            notify(NoteType.ORG_DATA_ERROR, e);
        }
    }, [sockCtx, props.orgData, editedSettings, userCanAdmin]);

    const change = useCallback(
        <K extends keyof OrganizationHeader>(field: K, value: OrganizationHeader[K]) => {
            const updatedSettings = { ...editedSettings, [field]: value };
            setEditedSettings(updatedSettings);
            unsavedCtx.setSavedState(Savable.OrgSettings, Object.keys(updatedSettings).length === 0);
        },
        [editedSettings, props.orgData, unsavedCtx]
    );

    const resetChanges = useCallback(() => {
        setEditedSettings({});
        unsavedCtx.markChangesSaved(Savable.OrgSettings);
    }, [unsavedCtx]);

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
                    gap={'lg'}
                >
                    <TextInput
                        label="Organization Name"
                        placeholder="My Organization"
                        value={editedSettings.name ?? props.orgData.name}
                        onChange={(e) => {
                            change('name', e.target.value);
                        }}
                        disabled={!userCanAdmin}
                    />
                    <Textarea
                        label="Organization Description"
                        placeholder="Write some info about your organization"
                        value={editedSettings.description ?? props.orgData.description}
                        onChange={(e) => {
                            change('description', e.target.value);
                        }}
                        disabled={!userCanAdmin}
                    />
                    <Group
                        align="start"
                        wrap="nowrap"
                    >
                        <ImageUpload
                            currentImageUrl={editedSettings.logoUrl ?? props.orgData.logoUrl}
                            onUploadComplete={(url) => change('logoUrl', url)}
                            width={100}
                            height={100}
                            alt="Organization Logo"
                            style={{ width: 100, height: 100 }}
                        />
                        <TextInput
                            label="Organization Logo URL"
                            placeholder="https://mosaiq.dev/logo.png"
                            value={editedSettings.logoUrl ?? props.orgData.logoUrl}
                            onChange={(e) => {
                                change('logoUrl', e.target.value);
                            }}
                            disabled={!userCanAdmin}
                            style={{ flex: 1 }}
                        />
                    </Group>
                    <Group>
                        <Button
                            variant="outline"
                            onClick={resetChanges}
                            disabled={!userCanAdmin}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            onClick={handleSaveChanges}
                            disabled={!userCanAdmin || Object.keys(editedSettings).length === 0}
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
                            tooltip={
                                iAmOwner
                                    ? 'Organization owners cannot leave their own organization. Please transfer ownership first.'
                                    : 'Hold to leave this organization'
                            }
                            disabled={iAmOwner}
                            borderColor={COLORS.semantic.error}
                            defaultBorderColor={COLORS.border}
                        >
                            Hold to Leave Organization
                        </RectHoldingButton>
                        {iAmOwner && (
                            <Button
                                variant="outline"
                                color={COLORS.semantic.error}
                                onClick={() => {
                                    modals.openContextModal({
                                        modal: 'transferOrganization',
                                        title: 'Transfer Organization',
                                        innerProps: {},
                                    });
                                }}
                            >
                                Transfer Organization
                            </Button>
                        )}
                    </Group>
                </Stack>
            </Box>
        </Box>
    );
};
