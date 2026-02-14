import { Badge, Group } from '@mantine/core';
import { fullName, Position, UserId } from '@mosaiq/terrazzo-common';
import { useImageColor } from '@trz/hooks/useImageColor';
import { useUser } from '@trz/hooks/useUser';
import { COLORS } from '@trz/util/colors';
import { GiArrowCursor } from 'react-icons/gi';

interface UserCursorProps {
    position?: Position;
    idle: boolean;
    userId: UserId;
}

const UserCursor = (props: UserCursorProps) => {
    const user = useUser(props.userId);
    const imgColor = useImageColor(user?.profilePicture);

    if (!props.position) {
        return null;
    }

    return (
        <Group
            style={{
                position: 'absolute',
                left: props.position.x,
                top: props.position.y,
            }}
            wrap='nowrap'
            gap={0}
        >
            <GiArrowCursor
                size={'1.25rem'}
                color={props.idle ? COLORS.text.disabled : imgColor || COLORS.text.primary}
            />
            <Badge
                color={props.idle ? COLORS.text.disabled : imgColor || COLORS.text.primary}
                size="xs"
                ml={5}
                bd={`1px solid ${COLORS.border}`}
                styles={{label: {overflow: 'visible'}}}
                autoContrast={true}
            >
                {fullName(user)}
            </Badge>
        </Group>
    );
};

export default UserCursor;
