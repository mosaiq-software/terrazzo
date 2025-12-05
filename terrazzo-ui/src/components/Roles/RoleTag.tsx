import { Box } from '@mantine/core';
import { Role } from '@mosaiq/terrazzo-common/types';

interface RoleTagProps {
    role: Role;
}
export const RoleTag = (props: RoleTagProps) => {
    return (
        <Box
            py={4}
            px={8}
            style={{
                borderRadius: 12,
                backgroundColor: props.role.color,
                color: '#fff',
            }}
        >
            {props.role.name}
        </Box>
    );
};
