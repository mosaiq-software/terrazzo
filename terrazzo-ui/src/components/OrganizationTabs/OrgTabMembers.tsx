import { Box, Button, Divider, Group, Stack, Tabs, Text, Title } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { Invite, Member, MembershipRecord, OrganizationHeader, OrgMembershipLevel } from '@mosaiq/terrazzo-common/types';
import { isInviteExpired } from '@mosaiq/terrazzo-common/utils/inviteUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { useUser } from '@trz/contexts/user-context';
import { createInvite, deleteInvite, removeUserFromOrg, updateUsersOrgMembership } from '@trz/emitters';
import { useOrgInvites } from '@trz/hooks/useOrgInvites';
import { getInviteLink } from '@trz/util/linkUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { useMemo } from 'react';
import { MdAdd, MdOutlineMailOutline, MdOutlinePerson } from 'react-icons/md';
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

    const handleCreateInvite = async () => {
        try {
            const invite = await createInvite(sockCtx, props.orgData.id, 1);
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
                                <Button
                                    leftSection={<MdAdd size={18} />}
                                    onClick={handleCreateInvite}
                                    variant="light"
                                    size="sm"
                                >
                                    Create & Copy Invite
                                </Button>
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
