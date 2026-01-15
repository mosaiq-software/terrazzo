import { ActionIcon, Button, Divider, Group, Menu, Stack, Text, Title } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { Invite, isInviteExpired, OrganizationHeader } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { createInvite, deleteInvite } from '@trz/emitters';
import { useOrgInvites } from '@trz/hooks/useOrgInvites';
import { COLORS } from '@trz/util/colors';
import { getInviteLink } from '@trz/util/linkUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { useMemo } from 'react';
import { HiDotsVertical } from 'react-icons/hi';
import { IoChevronDown } from 'react-icons/io5';
import { InfinityChar } from '../../UI/InfinityChar';
import { InviteRow } from './InviteRow';

interface InvitesPanelProps {
    orgData: OrganizationHeader;
    userCanAdmin: boolean;
}

export const InvitesPanel = (props: InvitesPanelProps) => {
    const sockCtx = useSocket();
    const invites = useOrgInvites(props.orgData.id);
    const clipboard = useClipboard();

    const sortedInvites = useMemo(() => {
        const timeSortedInvites = [...invites].sort((a, b) => b.createdAt - a.createdAt);
        const nonExpiredInvites: Invite[] = [];
        const expiredInvites: Invite[] = [];
        for (const invite of timeSortedInvites) {
            (isInviteExpired(invite) ? expiredInvites : nonExpiredInvites).push(invite);
        }
        return { nonExpiredInvites, expiredInvites };
    }, [invites]);

    const handleCreateInvite = async (uses: number | null) => {
        if (!props.userCanAdmin) {
            notify(NoteType.GENERIC_ERROR, 'You do not have permission to create invites');
            return;
        }
        try {
            const invite = await createInvite(sockCtx, props.orgData.id, uses);
            if (!invite) {
                notify(NoteType.GENERIC_ERROR, 'Failed to create invite');
                return;
            }
            clipboard.copy(getInviteLink(invite.id));
            notify(NoteType.CHANGES_SAVED, 'Invite created and copied to clipboard!');
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
        }
    };

    const handleDeleteInvite = async (invite: Invite) => {
        if (!props.userCanAdmin) {
            notify(NoteType.GENERIC_ERROR, 'You do not have permission to delete invites');
            return;
        }
        try {
            await deleteInvite(sockCtx, invite.id);
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
        }
    };

    const handleDeleteAllInvites = async () => {
        if (!props.userCanAdmin) {
            notify(NoteType.GENERIC_ERROR, 'You do not have permission to delete invites');
            return;
        }
        try {
            for (const invite of invites) {
                await deleteInvite(sockCtx, invite.id);
                await new Promise((resolve) => setTimeout(resolve, 250));
            }
            notify(NoteType.CHANGES_SAVED, 'All invites revoked successfully!');
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
        }
    };

    return (
        <Stack
            px={'md'}
            gap="md"
            style={{
                width: '100%',
            }}
        >
            <Group
                justify="space-between"
                align="center"
            >
                <Title
                    order={4}
                    c={COLORS.text.primary}
                >
                    Invites
                </Title>
                {
                    <Group>
                        <Menu
                            trigger="hover"
                            withArrow
                            position="bottom-end"
                        >
                            <Menu.Target>
                                <Button
                                    variant="light"
                                    rightSection={<IoChevronDown size={18} />}
                                    size="sm"
                                >
                                    {clipboard.copied ? 'Copied!' : 'Create & Copy Invite'}
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item onClick={() => handleCreateInvite(1)}>1 use</Menu.Item>
                                <Menu.Item onClick={() => handleCreateInvite(5)}>5 uses</Menu.Item>
                                <Menu.Item onClick={() => handleCreateInvite(10)}>10 uses</Menu.Item>
                                <Menu.Item onClick={() => handleCreateInvite(null)}>
                                    <InfinityChar /> uses
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                        <Menu
                            trigger="hover"
                            withArrow
                            position="bottom-end"
                        >
                            <Menu.Target>
                                <ActionIcon
                                    variant="subtle"
                                    size="input-sm"
                                >
                                    <HiDotsVertical size={18} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    color={COLORS.semantic.error}
                                    onClick={handleDeleteAllInvites}
                                >
                                    Revoke All Invites
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                }
            </Group>
            {invites.length === 0 ? (
                <Text
                    c={COLORS.text.muted}
                    ta="center"
                    py="xl"
                >
                    No invites
                </Text>
            ) : (
                <Stack gap="sm">
                    {sortedInvites.nonExpiredInvites.length > 0 && (
                        <Text
                            c={COLORS.text.muted}
                            fz="sm"
                        >
                            Pending Invites
                        </Text>
                    )}
                    {[...sortedInvites.nonExpiredInvites].map((invite) => (
                        <InviteRow
                            key={invite.id}
                            invite={invite}
                            canManageInvites={true}
                            onDeleteInvite={() => handleDeleteInvite(invite)}
                        />
                    ))}
                    {sortedInvites.expiredInvites.length > 0 && sortedInvites.nonExpiredInvites.length > 0 && (
                        <Divider />
                    )}
                    {sortedInvites.expiredInvites.length > 0 && (
                        <Text
                            c={COLORS.text.muted}
                            fz="sm"
                        >
                            Past Invites
                        </Text>
                    )}
                    {[...sortedInvites.expiredInvites].map((invite) => (
                        <InviteRow
                            key={invite.id}
                            invite={invite}
                            canManageInvites={false}
                            onDeleteInvite={() => handleDeleteInvite(invite)}
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    );
};
