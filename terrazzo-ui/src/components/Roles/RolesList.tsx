import { Group } from '@mantine/core';
import { Role } from '@mosaiq/terrazzo-common/types';
import { RoleTag } from './RoleTag';

interface RolesListProps {
    roles: Role[];
}
export const RolesList = (props: RolesListProps) => {
    return (
        <Group>
            {props.roles.map((role) => (
                <RoleTag
                    key={role.id}
                    role={role}
                />
            ))}
        </Group>
    );
};
