import { Text } from '@mantine/core';
import { fullName, Member, MembershipRecord, withIf } from '@mosaiq/terrazzo-common';
import { MdPersonRemove } from 'react-icons/md';
import { RolesList } from '../../Roles/RolesList';
import { ActionRow } from '../../UI/ActionRow';

interface MemberRowProps {
    member: Member;
    isCurrentUser: boolean;
    isOrgOwner?: boolean;
    onRemoveMember?: (member: MembershipRecord) => void;
}

export const MemberRow = (props: MemberRowProps) => {
    return (
        <ActionRow
            icon={props.member.user.profilePicture}
            title={fullName(props.member.user) + (props.isCurrentUser ? ' (You)' : '')}
            subtitle={`@${props.member.user.username}`}
            items={[
                <RolesList
                    userId={props.member.user.id}
                    key="roles-list"
                    containerProps={{ maw: 300 }}
                />,
                ...withIf(
                    <Text
                        c="yellow"
                        size="xs"
                        fw={500}
                        key="current-user-badge"
                    >
                        Organization Owner
                    </Text>,
                    props.isOrgOwner
                ),
            ]}
            menuLabel="Manage Member"
            menuItems={[
                ...withIf(
                    {
                        label: 'Remove Member',
                        onClick: () => props.onRemoveMember?.(props.member),
                        icon: <MdPersonRemove size={16} />,
                        color: 'red',
                    },
                    !props.isCurrentUser && !!props.onRemoveMember
                ),
            ]}
        />
    );
};
