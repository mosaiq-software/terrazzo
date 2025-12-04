import { Group, Text, Tooltip } from '@mantine/core';
import { Member, MembershipRecord, OrgMembershipLevel } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { MdAdminPanelSettings, MdPerson, MdPersonRemove } from 'react-icons/md';
import { ActionRow } from '../UI/ActionRow';

interface MemberRowProps {
    member: Member;
    isCurrentUser: boolean;
    canManageMembers: boolean;
    onRemoveMember?: (member: MembershipRecord) => void;
    onChangeRole?: (member: MembershipRecord, newRole: OrgMembershipLevel) => void;
}

export const MemberRow = (props: MemberRowProps) => {
    const isAdmin = props.member.record.permissionLevel === OrgMembershipLevel.ADMIN;

    return (
        <ActionRow
            icon={props.member.user.profilePicture}
            title={fullName(props.member.user) + (props.isCurrentUser ? ' (You)' : '')}
            subtitle={`@${props.member.user.username}`}
            items={[
                <Tooltip
                    key="role-tooltip"
                    label={isAdmin ? 'Admin' : 'Member'}
                    withArrow
                    openDelay={200}
                >
                    <Group
                        gap="xs"
                        px="sm"
                        py={4}
                        bg={isAdmin ? 'rgba(64, 192, 87, 0.15)' : 'rgba(255, 255, 255, 0.05)'}
                        style={{
                            borderRadius: '4px',
                            border: `1px solid ${isAdmin ? 'rgba(64, 192, 87, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                        }}
                    >
                        {isAdmin ? <MdAdminPanelSettings size={16} /> : <MdPerson size={16} />}
                        <Text
                            c="white"
                            size="xs"
                            fw={500}
                        >
                            {isAdmin ? 'Admin' : 'Member'}
                        </Text>
                    </Group>
                </Tooltip>,
            ]}
            menuLabel="Manage Member"
            menuItems={
                props.canManageMembers && !props.isCurrentUser
                    ? [
                          ...(props.onChangeRole
                              ? [
                                    {
                                        label: 'Make Admin',
                                        onClick: () => props.onChangeRole?.(props.member.record, OrgMembershipLevel.ADMIN),
                                        icon: <MdAdminPanelSettings size={16} />,
                                        disabled: isAdmin,
                                    },
                                    {
                                        label: 'Make Member',
                                        onClick: () => props.onChangeRole?.(props.member.record, OrgMembershipLevel.MEMBER),
                                        icon: <MdPerson size={16} />,
                                        disabled: !isAdmin,
                                    },
                                    '-' as const,
                                ]
                              : []),
                          ...(props.onRemoveMember
                              ? [
                                    {
                                        label: 'Remove Member',
                                        onClick: () => props.onRemoveMember?.(props.member.record),
                                        icon: <MdPersonRemove size={16} />,
                                        color: 'red',
                                    },
                                ]
                              : []),
                      ]
                    : undefined
            }
        />
    );
};
