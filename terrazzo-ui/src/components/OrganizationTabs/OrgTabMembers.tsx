import { Box, Button, Divider, Group, Stack, Tabs, Text, Title } from '@mantine/core';
import { Invite, Member, MembershipRecord, OrgMembershipLevel, Organization } from '@mosaiq/terrazzo-common/types';
import { isInviteExpired } from '@mosaiq/terrazzo-common/utils/inviteUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { useUser } from '@trz/contexts/user-context';
import { createInvite, deleteInvite, removeUserFromOrg, updateUsersOrgMembership } from '@trz/emitters';
import { useOrgInvites } from '@trz/hooks/useOrgInvites';
import { NoteType, notify } from '@trz/util/notifications';
import { useMemo } from 'react';
import { MdAdd, MdOutlineMailOutline, MdOutlinePerson } from 'react-icons/md';
import { InviteRow } from './InviteRow';
import { MemberRow } from './MemberRow';

interface OrgTabMembersProps {
    myMembershipRecord: MembershipRecord;
    orgData: Organization;
}
export const OrgTabMembers = (props: OrgTabMembersProps) => {
    const sockCtx = useSocket();
    const userCtx = useUser();
    const { invites, refresh } = useOrgInvites(props.orgData.id);

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
            await createInvite(sockCtx, props.orgData.id, 1);
            refresh();
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
        }
    };

    const handleDeleteInvite = async (invite: Invite) => {
        try {
            await deleteInvite(sockCtx, invite.id);
            refresh();
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
        }
    };

    const handleRemoveMember = async (member: Member) => {
        try {
            await removeUserFromOrg(sockCtx, member.user.id, props.orgData.id);
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
        }
    };

    const handleChangeRole = async (member: Member, newRole: OrgMembershipLevel) => {
        try {
            await updateUsersOrgMembership(sockCtx, member.user.id, props.orgData.id, newRole);
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
                        Members ({props.orgData.members.length})
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
                            {props.orgData.members.map((member) => (
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
                                Pending Invites
                            </Title>
                            {isAdmin && (
                                <Button
                                    leftSection={<MdAdd size={18} />}
                                    onClick={handleCreateInvite}
                                    variant="light"
                                    size="sm"
                                >
                                    Create Invite
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
                                {[...sortedInvites.nonExpiredInvites].map((invite) => (
                                    <InviteRow
                                        key={invite.id}
                                        invite={invite}
                                        canManageInvites={isAdmin}
                                        onDeleteInvite={() => handleDeleteInvite(invite)}
                                    />
                                ))}
                                <Divider />
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
