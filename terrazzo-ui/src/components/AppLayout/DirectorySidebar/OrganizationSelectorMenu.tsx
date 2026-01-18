import { Avatar, Button, Divider, Group, Menu, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { OrganizationId } from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { useUI } from '@trz/contexts/ui-context';
import { useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { COLORS } from '@trz/util/colors';
import { useCallback } from 'react';
import { MdAdd, MdMailOutline } from 'react-icons/md';
import { useNavigate } from 'react-router';

interface OrganizationSelectorMenuProps {}
export const OrganizationSelectorMenu = (props: OrganizationSelectorMenuProps) => {
    const navigate = useNavigate();
    const orgCtx = useOrg();
    const uiCtx = useUI();
    const unsavedCtx = useUnsavedChanges();

    const handleSelectOrganization = useCallback(
        async (orgId: OrganizationId) => {
            if (await unsavedCtx.confirmKeepUnsavedChanges()) {
                return;
            }
            orgCtx.selectAndGoToOrganization(orgId);
        },
        [unsavedCtx, orgCtx]
    );

    const handleSelectActiveOrganization = useCallback(async () => {
        if (!orgCtx.active) return;
        if (await unsavedCtx.confirmKeepUnsavedChanges()) {
            return;
        }
        navigate(`/org/${orgCtx.active.id}`);
    }, [unsavedCtx, orgCtx.active?.id, navigate]);

    const handleCreateOrganization = useCallback(() => {
        modals.openContextModal({
            modal: 'organization',
            title: 'Create New Organization',
            innerProps: {},
        });
    }, []);

    const handleJoinOrganization = useCallback(() => {
        modals.openContextModal({
            modal: 'joinOrganization',
            title: 'Join Organization',
            innerProps: {},
        });
    }, []);

    return (
        <Menu
            position={'bottom-start'}
            width={200}
            withinPortal
            trigger="hover"
            openDelay={300}
        >
            <Menu.Target>
                <Tooltip
                    label={orgCtx.active?.name}
                    withArrow
                    arrowPosition="side"
                    position="right"
                    openDelay={700}
                    closeDelay={200}
                >
                    <Button
                        display={'flex'}
                        variant={'subtle'}
                        px={0}
                        onClick={handleSelectActiveOrganization}
                    >
                        {orgCtx.active && (
                            <Avatar
                                src={orgCtx.active.logoUrl ?? undefined}
                                name={orgCtx.active.name}
                                color={'initials'}
                                display={'inline-block'}
                                size={'sm'}
                            />
                        )}
                        <Text
                            c={COLORS.text.primary}
                            style={{
                                textWrap: 'nowrap',
                                textAlign: 'left',
                                width: '220px',
                                paddingLeft: '5px',
                            }}
                        >
                            {orgCtx.active?.name ?? 'Select Organization'}
                        </Text>
                    </Button>
                </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Switch Organization</Menu.Label>
                {orgCtx.allOrganizations.map((org) => (
                    <Menu.Item key={org.id}>
                        <Group
                            wrap="nowrap"
                            gap={8}
                            px={0}
                            onClick={() => handleSelectOrganization(org.id)}
                        >
                            <Avatar
                                src={org.logoUrl ?? undefined}
                                name={org.name}
                                color={'initials'}
                                display={'inline-block'}
                                size={'sm'}
                            />
                            <Text
                                c={COLORS.text.primary}
                                style={{
                                    textWrap: 'nowrap',
                                    textAlign: 'left',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '130px',
                                }}
                            >
                                {org.name}
                            </Text>
                        </Group>
                    </Menu.Item>
                ))}
                <Divider my="xs" />
                <Menu.Item onClick={handleJoinOrganization}>
                    <Group
                        wrap="nowrap"
                        gap={8}
                        px={0}
                    >
                        <MdMailOutline
                            size={'1.25rem'}
                            color={COLORS.text.muted}
                        />
                        <Text
                            c={COLORS.text.muted}
                            style={{
                                textWrap: 'nowrap',
                                textAlign: 'left',
                            }}
                        >
                            Join Organization
                        </Text>
                    </Group>
                </Menu.Item>
                <Menu.Item onClick={handleCreateOrganization}>
                    <Group
                        wrap="nowrap"
                        gap={8}
                        px={0}
                    >
                        <MdAdd
                            size={'1.25rem'}
                            color={COLORS.text.muted}
                        />
                        <Text
                            c={COLORS.text.muted}
                            style={{
                                textWrap: 'nowrap',
                                textAlign: 'left',
                            }}
                        >
                            Create Organization
                        </Text>
                    </Group>
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};
