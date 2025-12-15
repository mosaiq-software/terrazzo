import { Group, Stack, Title } from '@mantine/core';
import { Member, MembershipRecord, OrganizationHeader } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { useUser } from '@trz/contexts/user-context';
import { removeUserFromOrg } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useCallback, useMemo } from 'react';
import { MemberRow } from './MemberRow';

interface MembersPanelProps {
    orgData: OrganizationHeader;
    members: Member[];
    userCanAdmin: boolean;
}

export const MembersPanel = (props: MembersPanelProps) => {
    const userCtx = useUser();
    const sockCtx = useSocket();

    const handleRemoveMember = useCallback(
        async (member: MembershipRecord) => {
            if (!props.userCanAdmin) {
                notify(NoteType.GENERIC_ERROR, 'You do not have permission to remove members');
                return;
            }
            try {
                await removeUserFromOrg(sockCtx, member.userId, props.orgData.id);
            } catch (err) {
                notify(NoteType.GENERIC_ERROR, err);
            }
        },
        [props.orgData.id, props.userCanAdmin, sockCtx]
    );

    const orgOwner = useMemo(() => props.members.find((m) => m.userId === props.orgData.ownerId), [props.members, props.orgData.ownerId]);

    const otherMembersSorted = useMemo(() => {
        return props.members.filter((m) => m.userId !== props.orgData.ownerId).sort((a, b) => a.joinedAt - b.joinedAt);
    }, [props.members, props.orgData.ownerId]);

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
                    c="#fff"
                >
                    Members
                </Title>
            </Group>
            <Stack gap="sm">
                {orgOwner && (
                    <MemberRow
                        key={orgOwner.user.id}
                        member={orgOwner}
                        isCurrentUser={orgOwner.user.id === userCtx.userData?.id}
                        isOrgOwner
                    />
                )}
                {otherMembersSorted.map((member) => (
                    <MemberRow
                        key={member.user.id}
                        member={member}
                        isCurrentUser={member.user.id === userCtx.userData?.id}
                        onRemoveMember={handleRemoveMember}
                    />
                ))}
            </Stack>
        </Stack>
    );
};
