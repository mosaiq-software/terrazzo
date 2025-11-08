import { Avatar, Button, Grid, Text, Tooltip } from '@mantine/core';
import { Role, RoleNames } from '@mosaiq/terrazzo-common/constants';
import { Invite } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { NoteColor } from '@trz/util/notifications';
import { IoMdClose } from 'react-icons/io';

interface PendingInviteRowProps {
    invite: Invite;
    editorPermLevel: Role;
    onRevokeInvite: () => void;
}
export const PendingInviteRow = (props: PendingInviteRowProps) => {
    const date = new Date(0);
    date.setUTCMilliseconds(props.invite.createdAt);
    return (
        <Grid
            py="sm"
            style={{
                borderBottom: '1px solid #ffffff10',
            }}
        >
            <Grid.Col span={1}>
                <Avatar
                    src={props.invite.toUser.profilePicture}
                    visibleFrom="sm"
                />
            </Grid.Col>
            <Grid.Col span={7}>
                <Text c="#fff">
                    {fullName(props.invite.fromUser)} invited{' '}
                    <Text
                        span
                        fw="700"
                    >
                        {fullName(props.invite.toUser)}
                    </Text>{' '}
                    as a {RoleNames[props.invite.userRole]} on {date.toLocaleString()}
                </Text>
            </Grid.Col>
            <Grid.Col span={1}>
                {props.editorPermLevel >= Role.ADMIN && (
                    <Tooltip
                        label="Revoke Invite"
                        bg={NoteColor.ERROR}
                    >
                        <Button
                            variant="subtle"
                            c={NoteColor.ERROR}
                            onClick={props.onRevokeInvite}
                        >
                            <IoMdClose />
                        </Button>
                    </Tooltip>
                )}
            </Grid.Col>
        </Grid>
    );
};
