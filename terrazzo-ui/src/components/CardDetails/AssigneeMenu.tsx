import { Avatar, Button, Menu, Stack } from '@mantine/core';
import { Card } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { updateCardAssignee } from '@trz/emitters';
import { MdOutlineAddCircle } from 'react-icons/md';
import { AvatarRow } from '../AvatarRow';

interface AssigneeMenuProps {
    card: Card;
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
        >
            <Menu.Target>
                <Button
                    variant="subtle"
                    justify={'flex-start'}
                >
                    {props.card.assignees.length ? (
                        <AvatarRow
                            users={props.card.assignees}
                            maxUsers={3}
                        />
                    ) : (
                        <MdOutlineAddCircle
                            size="1.5rem"
                            color="white"
                        />
                    )}
                </Button>
            </Menu.Target>
            <Menu.Dropdown
                ta="center"
                miw="10rem"
            >
                <Menu.Label>Assignees</Menu.Label>
                <Stack gap={1}>
                    {orgCtx.members.map((memRec) => {
                        const isMember = props.card.assignees.includes(memRec.user.id);
                        return (
                            <Button
                                key={memRec.user.id}
                                bg={isMember ? 'blue' : 'transparent'}
                                ta="left"
                                justify="start"
                                c={'white'}
                                style={{
                                    borderRadius: '4px',
                                }}
                                leftSection={
                                    <Avatar
                                        src={memRec.user.profilePicture}
                                        size={24}
                                    />
                                }
                                onClick={() => {
                                    updateCardAssignee(sockCtx, props.card.id, memRec.user.id, !isMember);
                                }}
                            >
                                {fullName(memRec.user)}
                            </Button>
                        );
                    })}
                </Stack>
            </Menu.Dropdown>
        </Menu>
    );
};
