import { Badge, Box } from '@mantine/core';
import { fullName, Position, UserId } from '@mosaiq/terrazzo-common';
import { useUser } from '@trz/hooks/data/useUser';
import { useImageColor } from '@trz/hooks/util/useImageColor';
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
        <Box
            style={{
                position: 'absolute',
                left: props.position.x,
                top: props.position.y,
            }}
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
                autoContrast={true}
            >
                {fullName(user)}
            </Badge>
        </Box>
    );
};

export default UserCursor;
