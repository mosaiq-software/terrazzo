import { Avatar, Group, Stack, Text } from '@mantine/core';
import { UserHeader } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { RolesList } from '@trz/components/Roles/RolesList';
import { forAllClickEvents, noEventBubble } from '@trz/util/eventUtils';

interface UserProfilePopupProps {
    user: UserHeader;
}
export const UserProfilePopup = (props: UserProfilePopupProps) => {
    return (
        <Stack
            p={'sm'}
            {...forAllClickEvents(noEventBubble)}
        >
            <Group gap="sm">
                <Avatar
                    src={props.user.profilePicture}
                    size={60}
                    name={fullName(props.user)}
                    color="initials"
                />
                <Stack gap="0">
                    <Text fw={500}>{fullName(props.user)}</Text>
                    <Text
                        size="sm"
                        c="dimmed"
                    >
                        @{props.user.username}
                    </Text>
                </Stack>
            </Group>
            <RolesList
                userId={props.user.id}
                containerProps={{ maw: 300 }}
            />
        </Stack>
    );
};
