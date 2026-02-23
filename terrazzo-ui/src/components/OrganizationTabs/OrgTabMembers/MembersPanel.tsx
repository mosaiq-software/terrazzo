import { Group, Stack, Title } from '@mantine/core';
import { MembershipRecord, OrganizationHeader } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { useUserContext } from '@trz/contexts/user-context';
import { removeUserFromOrg } from '@trz/emitters';
import { COLORS } from '@trz/util/colors';
import { NoteType, notify } from '@trz/util/notifications';
import { useCallback, useMemo } from 'react';
import { MemberRow } from './MemberRow';

interface MembersPanelProps {
    orgData: OrganizationHeader;
    members: Member[];
    userCanAdmin: boolean;
}

export const MembersPanel = (props: MembersPanelProps) => {
    const userCtx = useUserContext();
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

    const orgOwner = useMemo(
        () => props.members.find((m) => m.userId === props.orgData.ownerId),
        [props.members, props.orgData.ownerId]
    );

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
                    c={COLORS.text.primary}
                >
                    Members
                </Title>
            </Group>
            <Stack gap="sm">
                {orgOwner && (
                    <MemberRow
                        key={orgOwner.user.id}
                        member={orgOwner}
                        isCurrentUser={orgOwner.user.id === userCtx.userId}
                        isOrgOwner
                    />
                )}
                {otherMembersSorted.map((member) => (
                    <MemberRow
                        key={member.user.id}
                        member={member}
                        isCurrentUser={member.user.id === userCtx.userId}
                        onRemoveMember={handleRemoveMember}
                    />
                ))}
            </Stack>
        </Stack>
    );
};
