import { Badge, Box } from '@mantine/core';
import { fullName, Position, UserId } from '@mosaiq/terrazzo-common';
import { useImageColor } from '@trz/hooks/useImageColor';
import { useUser } from '@trz/hooks/useUser';
import React from 'react';
import { GiArrowCursor } from 'react-icons/gi';

interface UserCursorProps {
    position?: Position;
    idle: boolean;
    userId: UserId;
}

const UserCursor = (props: UserCursorProps) => {
    const user = useUser(props.userId);
    const [color, setColor] = React.useState<string | undefined>(undefined);
    const IDLE_COLOR = '#afafaf';
    const imgColor = useImageColor(user?.profilePicture);
    React.useEffect(() => {
        setColor(imgColor ?? 'black');
    }, [imgColor]);

    if (!props.position) {
        return null;
    }

    return (
        <Box
            style={{
                position: 'absolute',
                left: props.position.x,
                top: props.position.y,
            }}
        >
            <GiArrowCursor
                size={'1.25rem'}
                color={props.idle ? IDLE_COLOR : color}
            />
            <Badge
                color={props.idle ? IDLE_COLOR : color}
                size="xs"
                ml={5}
                bd="1px solid #fff"
            >
                {fullName(user)}
            </Badge>
        </Box>
    );
};

export default UserCursor;
