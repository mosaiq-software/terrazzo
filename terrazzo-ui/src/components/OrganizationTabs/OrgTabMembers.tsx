import { ActionIcon, Box, Button, Divider, Group, Menu, Stack, Tabs, Text, Title } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { Invite, isInviteExpired, Member, MembershipRecord, OrganizationHeader, OrgMembershipLevel } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { useUser } from '@trz/contexts/user-context';
import { createInvite, deleteInvite, removeUserFromOrg, updateUsersOrgMembership } from '@trz/emitters';
import { useOrgInvites } from '@trz/hooks/useOrgInvites';
import { getInviteLink } from '@trz/util/linkUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { useMemo } from 'react';
import { HiDotsVertical } from 'react-icons/hi';
import { IoChevronDown } from 'react-icons/io5';
import { MdOutlineMailOutline, MdOutlinePerson } from 'react-icons/md';
import { InfinityChar } from '../UI/InfinityChar';
import { InviteRow } from './InviteRow';
import { MemberRow } from './MemberRow';

interface OrgTabMembersProps {
    myMembershipRecord: MembershipRecord;
    orgData: OrganizationHeader;
    members: Member[];
}
export const OrgTabMembers = (props: OrgTabMembersProps) => {
    const sockCtx = useSocket();
    const userCtx = useUser();
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

    const isAdmin = props.myMembershipRecord.permissionLevel === OrgMembershipLevel.ADMIN;

    const handleCreateInvite = async (uses: number | null) => {
        try {
            const invite = await createInvite(sockCtx, props.orgData.id, uses);
            if (!invite) {
                notify(NoteType.GENERIC_ERROR, new Error('Failed to create invite'));
                return;
            }
            clipboard.copy(getInviteLink(invite.id));
            notify(NoteType.CHANGES_SAVED, 'Invite created and copied to clipboard!');
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
        }
    };

    const handleDeleteInvite = async (invite: Invite) => {
        try {
            await deleteInvite(sockCtx, invite.id);
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
        }
    };

    const handleRemoveMember = async (member: MembershipRecord) => {
        try {
            await removeUserFromOrg(sockCtx, member.userId, props.orgData.id);
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
        }
    };

    const handleChangeRole = async (member: MembershipRecord, newRole: OrgMembershipLevel) => {
        try {
            await updateUsersOrgMembership(sockCtx, member.userId, props.orgData.id, newRole);
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
        }
    };

    const handleDeleteAllInvites = async () => {
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
            <Group
                w="100%"
                justify="space-between"
            >
                <Title
                    c="white"
                    pb="20"
                    order={4}
                    maw="200"
                >
                    Members
                </Title>
            </Group>
            <Tabs
                orientation="vertical"
                defaultValue="members"
                keepMounted={false}
                style={{
                    width: '100%',
                }}
            >
                <Tabs.List
                    style={{
                        width: '10rem',
                        color: 'white',
                        gap: 'lg',
                    }}
                >
                    <Tabs.Tab
                        value="members"
                        leftSection={<MdOutlinePerson size={18} />}
                    >
                        Members ({props.members.length})
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="invites"
                        leftSection={<MdOutlineMailOutline size={18} />}
                    >
                        Invites ({sortedInvites.nonExpiredInvites.length})
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="members">
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
                                c="#fff"
                            >
                                Members
                            </Title>
                        </Group>
                        <Stack gap="sm">
                            {props.members.map((member) => (
                                <MemberRow
                                    key={member.user.id}
                                    member={member}
                                    isCurrentUser={member.user.id === userCtx.userData?.id}
                                    canManageMembers={isAdmin}
                                    onRemoveMember={handleRemoveMember}
                                    onChangeRole={handleChangeRole}
                                />
                            ))}
                        </Stack>
                    </Stack>
                </Tabs.Panel>
                <Tabs.Panel value="invites">
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
                                c="#fff"
                            >
                                Invites
                            </Title>
                            {isAdmin && (
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
                                                color="red"
                                                onClick={handleDeleteAllInvites}
                                            >
                                                Revoke All Invites
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>
                            )}
                        </Group>
                        {invites.length === 0 ? (
                            <Text
                                c="dimmed"
                                ta="center"
                                py="xl"
                            >
                                No invites
                            </Text>
                        ) : (
                            <Stack gap="sm">
                                {sortedInvites.nonExpiredInvites.length > 0 && (
                                    <Text
                                        c="dimmed"
                                        fz="sm"
                                    >
                                        Pending Invites
                                    </Text>
                                )}
                                {[...sortedInvites.nonExpiredInvites].map((invite) => (
                                    <InviteRow
                                        key={invite.id}
                                        invite={invite}
                                        canManageInvites={isAdmin}
                                        onDeleteInvite={() => handleDeleteInvite(invite)}
                                    />
                                ))}
                                {sortedInvites.expiredInvites.length > 0 && sortedInvites.nonExpiredInvites.length > 0 && <Divider />}
                                {sortedInvites.expiredInvites.length > 0 && (
                                    <Text
                                        c="dimmed"
                                        fz="sm"
                                    >
                                        Past Invites
                                    </Text>
                                )}
                                {[...sortedInvites.expiredInvites].map((invite) => (
                                    <InviteRow
                                        key={invite.id}
                                        invite={invite}
                                        canManageInvites={isAdmin}
                                        onDeleteInvite={() => handleDeleteInvite(invite)}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
};
