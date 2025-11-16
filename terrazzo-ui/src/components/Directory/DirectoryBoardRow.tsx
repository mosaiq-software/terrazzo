import { Group, Box } from '@mantine/core';
import { BoardHeader } from '@mosaiq/terrazzo-common/types';
import { useNavigate } from 'react-router';

interface BoardRowProps {
    board: BoardHeader;
}
export const BoardRow = (props: BoardRowProps): React.JSX.Element => {
    const navigate = useNavigate();
    return (
        <Group
            onClick={() => navigate(`/board/${props.board.id}`)}
            style={{ cursor: 'pointer', width: '100%' }}
        >
            <Box c="white">{props.board.name}</Box>
        </Group>
    );
};
