import { Group, Box } from '@mantine/core';
import { DirectoryHeader } from '@mosaiq/terrazzo-common/types';
import { useNavigate } from 'react-router';

interface DirectoryRowProps {
    directory: DirectoryHeader;
}
export const DirectoryRow = (props: DirectoryRowProps): React.JSX.Element => {
    const navigate = useNavigate();
    return (
        <Group
            onClick={() => navigate(`/dir/${props.directory.id}`)}
            style={{ cursor: 'pointer', width: '100%' }}
        >
            <Box c="white">{props.directory.name}</Box>
        </Group>
    );
};
