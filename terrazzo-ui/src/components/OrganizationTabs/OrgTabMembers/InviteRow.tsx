import { Button, Group, Text, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { Invite, isInviteExpired, withIf } from '@mosaiq/terrazzo-common';
import { formatTimeAgo } from '@trz/util/dateUtils';
import { uuidToReadableUuid } from '@trz/util/idUtils';
import { getInviteLink } from '@trz/util/linkUtils';
import { MdContentCopy, MdDelete, MdLink } from 'react-icons/md';
import { ActionRow } from '../../UI/ActionRow';
import { InfinityChar } from '../../UI/InfinityChar';

interface InviteRowProps {
    invite: Invite;
    canManageInvites: boolean;
    onDeleteInvite?: (invite: Invite) => void;
}

export const InviteRow = (props: InviteRowProps) => {
    const inviteUrl = getInviteLink(props.invite.id);
    const clipboard = useClipboard({ timeout: 2000 });
    const isUnlimited = props.invite.maxUses === null;
    const usesRemaining = isUnlimited ? null : (props.invite.maxUses ?? 0) - props.invite.uses;
    const isExpired = isInviteExpired(props.invite);

    return (
        <ActionRow
            icon={MdLink}
            title={uuidToReadableUuid(props.invite.id)}
            subtitle={`Created ${formatTimeAgo(props.invite.createdAt)}`}
            disabled={isExpired}
            items={[
                <Tooltip
                    key="uses-tooltip"
                    label={`${isUnlimited ? 'Unlimited' : usesRemaining !== null ? usesRemaining : 0} use${usesRemaining === 1 ? '' : 's'} remaining`}
                    withArrow
                    openDelay={200}
                >
                    <Group
                        gap="xs"
                        px="sm"
                        py={4}
                        bg="rgba(255, 255, 255, 0.05)"
                        style={{
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <Text
                            c="white"
                            size="xs"
                            fw={500}
                        >
                            {isUnlimited ? (
                                <>
                                    {`${props.invite.uses} / `}
                                    <InfinityChar /> uses
                                </>
                            ) : (
                                `${props.invite.uses} / ${props.invite.maxUses} uses`
                            )}
                        </Text>
                    </Group>
                </Tooltip>,
                <Button
                    key="copy-button"
                    variant="light"
                    size="xs"
                    leftSection={<MdContentCopy size={14} />}
                    onClick={() => clipboard.copy(inviteUrl)}
                    color={clipboard.copied ? 'green' : 'blue'}
                    disabled={isExpired}
                >
                    {clipboard.copied ? 'Copied!' : 'Copy Link'}
                </Button>,
            ]}
            menuLabel="Manage Invite"
            menuItems={[
                ...withIf(
                    {
                        label: 'Delete Invite',
                        onClick: () => props.onDeleteInvite?.(props.invite),
                        icon: <MdDelete size={16} />,
                        color: 'red',
                    },
                    props.canManageInvites && !!props.onDeleteInvite
                ),
            ]}
        />
    );
};
