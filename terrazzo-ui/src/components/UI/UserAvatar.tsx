import { Avatar, Group, MantineSize, Menu, Stack, Text } from '@mantine/core';
import { UserHeader } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { completelyCaptureEvent, forAllClickEvents, noEventBubble } from '@trz/util/eventUtils';

interface UserAvatarProps {
    user: UserHeader;
    size?: number | MantineSize | (string & {});
    showProfilePopover?: boolean;
}
export const UserAvatar = (props: UserAvatarProps) => {
    return (
        <Menu
            width={200}
            position="bottom"
            withArrow
            shadow="md"
            trigger="hover"
            closeOnClickOutside
            withinPortal
            openDelay={300}
            disabled={!props.showProfilePopover}
        >
            <Menu.Target>
                <Avatar
                    src={props.user.profilePicture}
                    size={props.size}
                    name={fullName(props.user)}
                    color="initials"
                    style={{
                        cursor: props.showProfilePopover ? 'pointer' : 'auto',
                    }}
                    onClick={(e) => {
                        if (props.showProfilePopover) {
                            completelyCaptureEvent(e);
                        }
                    }}
                />
            </Menu.Target>
            <Menu.Dropdown>
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
                </Stack>
            </Menu.Dropdown>
        </Menu>
    );
};
