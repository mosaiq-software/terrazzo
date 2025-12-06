import { fullName, Member, MembershipRecord } from '@mosaiq/terrazzo-common';
import { MdPersonRemove } from 'react-icons/md';
import { RolesList } from '../Roles/RolesList';
import { ActionRow } from '../UI/ActionRow';

interface MemberRowProps {
    member: Member;
    isCurrentUser: boolean;
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
            ]}
            menuLabel="Manage Member"
            menuItems={
                !props.isCurrentUser
                    ? [
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
};
