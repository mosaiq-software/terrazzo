import { ActionIcon, Badge, Box, Button, Group, Menu, Text, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { Invite } from '@mosaiq/terrazzo-common/types';
import { isInviteExpired } from '@mosaiq/terrazzo-common/utils/inviteUtils';
import { formatTimeAgo } from '@trz/util/dateUtils';
import { uuidToReadableUuid } from '@trz/util/idUtils';
import { HiDotsVertical } from 'react-icons/hi';
import { MdContentCopy, MdDelete, MdLink } from 'react-icons/md';

interface InviteRowProps {
    invite: Invite;
    canManageInvites: boolean;
    onDeleteInvite?: (invite: Invite) => void;
}

export const InviteRow = (props: InviteRowProps) => {
    const inviteUrl = `${window.location.origin}/invite/${props.invite.id}`;
    const clipboard = useClipboard({ timeout: 2000 });
    const isUnlimited = props.invite.maxUses === null;
    const usesRemaining = isUnlimited ? null : (props.invite.maxUses ?? 0) - props.invite.uses;
    const isExpired = isInviteExpired(props.invite);

    return (
        <Group
            w="100%"
            px="md"
            py="sm"
            bg="#212226"
            style={{
                borderRadius: '8px',
                opacity: isExpired ? 0.4 : 1,
            }}
            justify="space-between"
            wrap="nowrap"
        >
            <Group
                gap="md"
                wrap="nowrap"
                style={{ flex: 1, overflow: 'hidden' }}
            >
                <Box
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: isExpired ? 'rgba(255, 107, 107, 0.2)' : 'rgba(64, 192, 207, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <MdLink
                        size={20}
                        color={isExpired ? 'rgba(255, 107, 107, 0.8)' : 'rgba(64, 192, 207, 0.8)'}
                    />
                </Box>
                <Box style={{ flex: 1, overflow: 'hidden' }}>
                    <Group gap="xs">
                        <Text
                            c="white"
                            fw={500}
                            size="sm"
                            style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontFamily: 'monospace',
                            }}
                        >
                            {uuidToReadableUuid(props.invite.id)}
                        </Text>
                        {isExpired && (
                            <Badge
                                size="xs"
                                color="red"
                                variant="light"
                            >
                                Expired
                            </Badge>
                        )}
                    </Group>
                    <Text
                        c="dimmed"
                        size="xs"
                    >
                        Created {formatTimeAgo(props.invite.createdAt)}
                    </Text>
                </Box>
            </Group>

            <Group
                gap="sm"
                wrap="nowrap"
            >
                <Tooltip
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
                            {isUnlimited ? `${props.invite.uses} / ∞` : `${props.invite.uses} / ${props.invite.maxUses}`} uses
                        </Text>
                    </Group>
                </Tooltip>

                <Button
                    variant="light"
                    size="xs"
                    leftSection={<MdContentCopy size={14} />}
                    onClick={() => clipboard.copy(inviteUrl)}
                    color={clipboard.copied ? 'green' : 'blue'}
                    disabled={isExpired}
                >
                    {clipboard.copied ? 'Copied!' : 'Copy Link'}
                </Button>

                {props.canManageInvites && props.onDeleteInvite && (
                    <Menu
                        position="bottom-end"
                        withArrow
                        shadow="md"
                        disabled={isExpired}
                    >
                        <Menu.Target>
                            <ActionIcon
                                variant="subtle"
                                c="white"
                                size="lg"
                            >
                                <HiDotsVertical size={18} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>Manage Invite</Menu.Label>
                            <Menu.Item
                                color="red"
                                leftSection={<MdDelete size={16} />}
                                onClick={() => props.onDeleteInvite?.(props.invite)}
                            >
                                Delete Invite
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}
            </Group>
        </Group>
    );
};
