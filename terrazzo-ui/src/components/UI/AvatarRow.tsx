import { Avatar, Text, Tooltip } from '@mantine/core';
import { UserHeader, UserId } from '@mosaiq/terrazzo-common/types';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { getUserHeader } from '@trz/emitters';
import { useEffect, useState } from 'react';
import { UserAvatar } from './UserAvatar/UserAvatar';

interface AvatarRowProps {
    users: (UserHeader | UserId)[];
    maxUsers: number;
    showProfilePopover?: boolean;
    showTooltip?: boolean;
    animateOnHover?: boolean;
}
export const AvatarRow = (props: AvatarRowProps) => {
    const sockCtx = useSocket();
    const orgCtx = useOrg();
    const [users, setUsers] = useState<UserHeader[]>([]);

    useEffect(() => {
        if (props.users.length === 0) {
            setUsers([]);
            return;
        }

        const loadUsers = async () => {
            const list: UserHeader[] = [];
            for (const uObj of props.users) {
                if (typeof uObj === 'string') {
                    let user = orgCtx.members.find((m) => m.user.id === uObj)?.user;
                    if (!user) {
                        user = await getUserHeader(sockCtx, uObj);
                    }
                    if (user) {
                        list.push(user);
                    }
                } else {
                    list.push(uObj);
                }
            }
            setUsers(list);
        };
        loadUsers();
    }, [props.users]);

    return (
        <Avatar.Group
            spacing="6"
            style={{ justifyContent: 'flex-end' }}
        >
            {
                // only take the first n users
                users.slice(0, props.maxUsers).map((user, index) => (
                    <UserAvatar
                        user={user}
                        size="sm"
                        showProfilePopover={props.showProfilePopover}
                        showTooltip={props.showTooltip}
                        animateOnHover={props.animateOnHover}
                        key={user.id}
                    />
                ))
            }
            {
                // if there are more than n users, show a +{n} avatar
                users.length > props.maxUsers && (
                    <Tooltip
                        position="bottom"
                        withArrow
                        radius="lg"
                        label={users.slice(props.maxUsers).map((user, index) => (
                            <Text key={user.id}>{user.firstName + ' ' + user.lastName + '(' + user.username + ')'}</Text>
                        ))}
                    >
                        <Avatar size="sm">+{props.users.length - 3}</Avatar>
                    </Tooltip>
                )
            }
        </Avatar.Group>
    );
};
