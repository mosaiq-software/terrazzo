import { Avatar, Button, Grid, Select, Title, Tooltip } from '@mantine/core';
import { Role, RoleNames } from '@mosaiq/terrazzo-common/constants';
import { MembershipRecord, MembershipRecordId, UserHeader } from '@mosaiq/terrazzo-common/types';
import { NoteColor } from '@trz/util/notifications';
import { IoMdClose } from 'react-icons/io';

interface MembershipRowProps {
    user: UserHeader;
    record: MembershipRecord;
    editorsRecord: MembershipRecord;
    onEditRole: (record: MembershipRecordId, role: Role) => void;
    onRemoveMember: () => void;
    readonly?: boolean;
}
export const MembershipRow = (props: MembershipRowProps) => {
    return (
        <Grid
            py="sm"
            style={{
                borderBottom: '1px solid #ffffff10',
            }}
        >
            <Grid.Col span={1}>
                <Avatar
                    src={props.user.profilePicture}
                    visibleFrom="sm"
                />
            </Grid.Col>
            <Grid.Col span={4}>
                <Title
                    order={5}
                    c="#fff"
                >
                    {props.user.firstName} {props.user.lastName}
                </Title>
            </Grid.Col>
            <Grid.Col span={4}>
                <Title
                    order={6}
                    c="#ddd"
                >
                    @{props.user.username}
                </Title>
            </Grid.Col>
            <Grid.Col
                span={2}
                miw="95px"
            >
                {props.record.userRole < Role.OWNER && (
                    <Select
                        placeholder="Role"
                        data={[RoleNames[Role.READ], RoleNames[Role.WRITE], RoleNames[Role.ADMIN]]}
                        value={RoleNames[props.record.userRole]}
                        allowDeselect={false}
                        disabled={props.readonly || props.editorsRecord.userRole < Role.ADMIN || props.record.userRole === Role.OWNER || props.editorsRecord.userId === props.record.userId}
                        onChange={(e) => {
                            props.onEditRole(props.record.id, RoleNames.indexOf(e ?? RoleNames[Role.READ]));
                        }}
                    />
                )}
                {props.record.userRole === Role.OWNER && (
                    <Select
                        placeholder="Role"
                        data={[RoleNames[Role.OWNER]]}
                        value={RoleNames[Role.OWNER]}
                        allowDeselect={false}
                        disabled={true}
                    />
                )}
            </Grid.Col>
            <Grid.Col span={1}>
                {!props.readonly && props.editorsRecord.userRole >= Role.ADMIN && (
                    <Tooltip
                        label={props.record.userRole >= Role.OWNER ? "Can't Remove Owner" : props.editorsRecord.userId === props.record.userId ? "Can't Remove Yourself" : 'Remove Member'}
                        bg={NoteColor.ERROR}
                    >
                        <Button
                            disabled={props.record.userRole >= Role.OWNER || props.editorsRecord.userId === props.record.userId}
                            variant="subtle"
                            c={NoteColor.ERROR}
                            onClick={() => {
                                props.onRemoveMember();
                            }}
                        >
                            <IoMdClose />
                        </Button>
                    </Tooltip>
                )}
            </Grid.Col>
        </Grid>
    );
};
