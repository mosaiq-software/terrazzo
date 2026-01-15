import { Center, Tooltip } from '@mantine/core';
import { fullName, Member, MembershipRecord, withIf } from '@mosaiq/terrazzo-common';
import { COLORS } from '@trz/util/colors';
import { MdPersonRemove, MdStar } from 'react-icons/md';
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
                    <Tooltip
                        key="org-owner-tooltip"
                        label="Organization owner"
                        withArrow
                    >
                        <Center>
                            <MdStar
                                size={20}
                                color="gold"
                            />
                        </Center>
                    </Tooltip>,
                    props.isOrgOwner
                ),
            ]}
            menuLabel="Manage Member"
            menuItems={[
                ...withIf(
                    {
                        label: 'Hold to Remove Member',
                        onClick: () => props.onRemoveMember?.(props.member),
                        icon: <MdPersonRemove size={16} />,
                        color: COLORS.semantic.error,
                        longHold: true,
                    },
                    !props.isCurrentUser && !!props.onRemoveMember
                ),
            ]}
        />
    );
};
