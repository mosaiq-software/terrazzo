import { Avatar, Button, Menu, Stack } from '@mantine/core';
import { CardId, fullName, UserId } from '@mosaiq/terrazzo-common';
import { AvatarRow } from '@trz/components/UI/AvatarRow';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { updateCardAssignee } from '@trz/emitters';
import { COLORS } from '@trz/util/colors';
import { MdOutlineAddCircle } from 'react-icons/md';

interface AssigneeMenuProps {
    cardId: CardId;
    assignees: UserId[];
    viewOnly?: boolean;
}

export const AssigneeMenu = (props: AssigneeMenuProps) => {
    const sockCtx = useSocket();
    const orgCtx = useOrg();

    return (
        <Menu
            position="bottom-start"
            withArrow
            arrowPosition="side"
            closeOnClickOutside={true}
            trigger="hover"
            closeDelay={200}
            disabled={props.viewOnly}
        >
            <Menu.Target>
                {props.viewOnly ? (
                    <AvatarRow
                        users={props.assignees}
                        maxUsers={3}
                        showProfilePopover
                        showTooltip
                    />
                ) : (
                    <Button
                        variant="subtle"
                        justify={'flex-start'}
                    >
                        {props.assignees.length ? (
                            <AvatarRow
                                users={props.assignees}
                                maxUsers={3}
                            />
                        ) : (
                            <MdOutlineAddCircle
                                size="1.5rem"
                                color={COLORS.text.primary}
                            />
                        )}
                    </Button>
                )}
            </Menu.Target>
            <Menu.Dropdown
                ta="center"
                miw="10rem"
            >
                <Menu.Label>Assignees</Menu.Label>
                <Stack gap={1}>
                    {orgCtx.members.map((memberId) => {
                        const isMember = props.assignees.includes(memberId);
                        return (
                            <Button
                                key={memberId}
                                bg={isMember ? COLORS.semantic.info : COLORS.transparent}
                                ta="left"
                                justify="start"
                                c={COLORS.text.primary}
                                style={{
                                    borderRadius: '4px',
                                }}
                                leftSection={
                                    <Avatar
                                        src={memberId.user.profilePicture}
                                        size={24}
                                        name={fullName(memberId.user)}
                                        color="initials"
                                    />
                                }
                                onClick={() => {
                                    updateCardAssignee(sockCtx, props.cardId, memberId, !isMember);
                                }}
                            >
                                {fullName(memberId.user)}
                            </Button>
                        );
                    })}
                </Stack>
            </Menu.Dropdown>
        </Menu>
    );
};
