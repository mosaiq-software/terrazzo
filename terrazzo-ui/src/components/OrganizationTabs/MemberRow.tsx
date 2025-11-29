import { Group, Text, Tooltip } from '@mantine/core';
import { Member, OrgMembershipLevel } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { MdAdminPanelSettings, MdPerson, MdPersonRemove } from 'react-icons/md';
import { ActionRow } from '../ActionRow';

interface MemberRowProps {
    member: Member;
    isCurrentUser: boolean;
    canManageMembers: boolean;
    onRemoveMember?: (member: Member) => void;
    onChangeRole?: (member: Member, newRole: OrgMembershipLevel) => void;
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
                                        onClick: () => props.onChangeRole?.(props.member, OrgMembershipLevel.ADMIN),
                                        icon: <MdAdminPanelSettings size={16} />,
                                        disabled: isAdmin,
                                    },
                                    {
                                        label: 'Make Member',
                                        onClick: () => props.onChangeRole?.(props.member, OrgMembershipLevel.MEMBER),
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
                                        onClick: () => props.onRemoveMember?.(props.member),
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

    // return (
    //     <Group
    //         w="100%"
    //         px="md"
    //         py="sm"
    //         bg="#212226"
    //         style={{
    //             borderRadius: '8px',
    //         }}
    //         justify="space-between"
    //         wrap="nowrap"
    //     >
    //         <Group
    //             gap="md"
    //             wrap="nowrap"
    //             style={{ flex: 1, overflow: 'hidden' }}
    //         >
    //             <Avatar
    //                 src={props.member.user.profilePicture}
    //                 size={40}
    //                 radius="xl"
    //             />
    //             <div style={{ flex: 1, overflow: 'hidden' }}>
    //                 <Group gap="xs">
    //                     <Text
    //                         c="white"
    //                         fw={500}
    //                         size="sm"
    //                         style={{
    //                             overflow: 'hidden',
    //                             textOverflow: 'ellipsis',
    //                             whiteSpace: 'nowrap',
    //                         }}
    //                     >
    //                         {fullName(props.member.user)}
    //                     </Text>
    //                     {props.isCurrentUser && (
    //                         <Text
    //                             c="dimmed"
    //                             size="xs"
    //                             fw={500}
    //                         >
    //                             (You)
    //                         </Text>
    //                     )}
    //                 </Group>
    //                 <Text
    //                     c="dimmed"
    //                     size="xs"
    //                     style={{
    //                         overflow: 'hidden',
    //                         textOverflow: 'ellipsis',
    //                         whiteSpace: 'nowrap',
    //                     }}
    //                 >
    //                     @{props.member.user.username}
    //                 </Text>
    //             </div>
    //         </Group>

    //         <Group
    //             gap="sm"
    //             wrap="nowrap"
    //         >
    //             <Tooltip
    //                 label={isAdmin ? 'Admin' : 'Member'}
    //                 withArrow
    //                 openDelay={200}
    //             >
    //                 <Group
    //                     gap="xs"
    //                     px="sm"
    //                     py={4}
    //                     bg={isAdmin ? 'rgba(64, 192, 87, 0.15)' : 'rgba(255, 255, 255, 0.05)'}
    //                     style={{
    //                         borderRadius: '4px',
    //                         border: `1px solid ${isAdmin ? 'rgba(64, 192, 87, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    //                     }}
    //                 >
    //                     {isAdmin ? <MdAdminPanelSettings size={16} /> : <MdPerson size={16} />}
    //                     <Text
    //                         c="white"
    //                         size="xs"
    //                         fw={500}
    //                     >
    //                         {isAdmin ? 'Admin' : 'Member'}
    //                     </Text>
    //                 </Group>
    //             </Tooltip>
    //             {props.canManageMembers && !props.isCurrentUser && (
    //                 <Menu
    //                     position="bottom-end"
    //                     withArrow
    //                     shadow="md"
    //                 >
    //                     <Menu.Target>
    //                         <ActionIcon
    //                             variant="subtle"
    //                             c="white"
    //                             size="lg"
    //                         >
    //                             <HiDotsVertical size={18} />
    //                         </ActionIcon>
    //                     </Menu.Target>
    //                     <Menu.Dropdown>
    //                         <Menu.Label>Manage Member</Menu.Label>
    //                         {props.onChangeRole && (
    //                             <>
    //                                 <Menu.Item
    //                                     leftSection={<MdAdminPanelSettings size={16} />}
    //                                     onClick={() => props.onChangeRole?.(props.member, OrgMembershipLevel.ADMIN)}
    //                                     disabled={isAdmin}
    //                                 >
    //                                     Make Admin
    //                                 </Menu.Item>
    //                                 <Menu.Item
    //                                     leftSection={<MdPerson size={16} />}
    //                                     onClick={() => props.onChangeRole?.(props.member, OrgMembershipLevel.MEMBER)}
    //                                     disabled={!isAdmin}
    //                                 >
    //                                     Make Member
    //                                 </Menu.Item>
    //                                 <Menu.Divider />
    //                             </>
    //                         )}
    //                         {props.onRemoveMember && (
    //                             <Menu.Item
    //                                 color="red"
    //                                 leftSection={<MdPersonRemove size={16} />}
    //                                 onClick={() => props.onRemoveMember?.(props.member)}
    //                             >
    //                                 Remove Member
    //                             </Menu.Item>
    //                         )}
    //                     </Menu.Dropdown>
    //                 </Menu>
    //             )}
    //         </Group>
    //     </Group>
    // );
};
