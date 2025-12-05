import { Avatar, MantineSize, Menu, Tooltip } from '@mantine/core';
import { UserHeader } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { completelyCaptureEvent } from '@trz/util/eventUtils';
import { forwardRef, useState } from 'react';
import { UserProfilePopup } from './UserProfilePopup';

interface UserAvatarProps {
    user: UserHeader;
    size?: number | MantineSize | (string & {});
    showProfilePopover?: boolean;
    showTooltip?: boolean;
    animateOnHover?: boolean;
}
export const UserAvatar = forwardRef<HTMLDivElement, UserAvatarProps>((props, ref) => {
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [hovered, setHovered] = useState(false);

    return (
        <Menu
            width={400}
            position="bottom-end"
            arrowPosition="center"
            arrowSize={10}
            withArrow
            shadow="md"
            trigger="click"
            closeOnClickOutside
            withinPortal
            disabled={!props.showProfilePopover}
            opened={popoverOpened}
            onChange={setPopoverOpened}
        >
            <Menu.Target>
                <Tooltip
                    key={props.user.id}
                    label={fullName(props.user)}
                    position="bottom"
                    withArrow
                    radius="lg"
                    disabled={!props.showTooltip || popoverOpened}
                >
                    <Avatar
                        src={props.user.profilePicture}
                        size={props.size}
                        name={fullName(props.user)}
                        color="initials"
                        style={{
                            cursor: props.showProfilePopover ? 'pointer' : 'auto',
                            transform: props.animateOnHover && hovered ? 'scale(1.1)' : 'scale(1.0)',
                            transition: props.animateOnHover ? 'transform 150ms ease-in-out' : undefined,
                        }}
                        onClick={(e) => {
                            if (props.showProfilePopover) {
                                completelyCaptureEvent(e);
                                setPopoverOpened((o) => !o);
                            }
                        }}
                        onMouseEnter={() => {
                            if (props.animateOnHover) {
                                setHovered(true);
                            }
                        }}
                        onMouseLeave={() => {
                            if (props.animateOnHover) {
                                setHovered(false);
                            }
                        }}
                    />
                </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
                <UserProfilePopup user={props.user} />
            </Menu.Dropdown>
        </Menu>
    );
});

UserAvatar.displayName = 'UserAvatar';
