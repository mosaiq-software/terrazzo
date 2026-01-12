import { Avatar, Group, Stack, Text } from '@mantine/core';
import { fullName, UserHeader } from '@mosaiq/terrazzo-common';
import { RolesList } from '@trz/components/Roles/RolesList';
import { COLORS } from '@trz/util/colors';
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
                        c={COLORS.text.muted}
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
