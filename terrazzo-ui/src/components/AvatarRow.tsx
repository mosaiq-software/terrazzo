import React, { useEffect, useState } from 'react';
import { Avatar, Tooltip, Text } from '@mantine/core';
import { UserHeader, UserId } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { getUserHeader } from '@trz/emitters';

interface AvatarRowProps {
    users: (UserHeader | UserId)[];
    maxUsers: number;
}
export const AvatarRow = (props: AvatarRowProps) => {
    const sockCtx = useSocket();
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
                    const user = await getUserHeader(sockCtx, uObj);
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
                    <Tooltip
                        key={user.id}
                        label={user.firstName + ' ' + user.lastName + '(' + user.username + ')'}
                        position="bottom"
                        withArrow
                        radius="lg"
                    >
                        <Avatar
                            src={user.profilePicture}
                            size="sm"
                            name={user.firstName + ' ' + user.lastName}
                            color="initials"
                        />
                    </Tooltip>
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
