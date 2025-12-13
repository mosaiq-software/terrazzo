import { Group, Stack, Title } from '@mantine/core';
import { Member, MembershipRecord, OrganizationHeader } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { useUser } from '@trz/contexts/user-context';
import { removeUserFromOrg } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { MemberRow } from '../MemberRow';

interface MembersPanelProps {
    orgData: OrganizationHeader;
    members: Member[];
    userCanAdmin: boolean;
}

export const MembersPanel = (props: MembersPanelProps) => {
    const userCtx = useUser();
    const sockCtx = useSocket();

    const handleRemoveMember = async (member: MembershipRecord) => {
        if (!props.userCanAdmin) {
            notify(NoteType.GENERIC_ERROR, 'You do not have permission to remove members');
            return;
        }
        try {
            await removeUserFromOrg(sockCtx, member.userId, props.orgData.id);
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
                        onRemoveMember={handleRemoveMember}
                    />
                ))}
            </Stack>
        </Stack>
    );
};
