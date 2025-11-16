import { Group, Box } from '@mantine/core';
import { DocumentHeader } from '@mosaiq/terrazzo-common/types';
import { useNavigate } from 'react-router';

interface DocumentRowProps {
    document: DocumentHeader;
}
export const DocumentRow = (props: DocumentRowProps): React.JSX.Element => {
    const navigate = useNavigate();
    return (
        <Group
            onClick={() => navigate(`/doc/${props.document.id}`)}
            style={{ cursor: 'pointer', width: '100%' }}
        >
            <Box c="white">{props.document.title}</Box>
        </Group>
    );
};
