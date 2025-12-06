import { Group, Stack, Switch, Text } from '@mantine/core';
import { COLOR_SUCCESS, COLOR_UNSET } from '@trz/util/colorUtils';
import { MdCheck, MdClose } from 'react-icons/md';

interface PermissionToggleProps {
    permissionName: string;
    permissionDescription: string;
    isEnabled: boolean;
    onToggle: (newState: boolean) => void;
}
export const PermissionToggle = (props: PermissionToggleProps) => {
    const { permissionName, permissionDescription, isEnabled, onToggle } = props;

    return (
        <Group
            wrap="nowrap"
            justify="space-between"
        >
            <Stack gap={0}>
                <Text size="sm">{permissionName}</Text>
                <Text
                    size="sm"
                    c="dimmed"
                >
                    {permissionDescription}
                </Text>
            </Stack>
            <Switch
                color={COLOR_SUCCESS}
                size="md"
                thumbIcon={
                    isEnabled ? (
                        <MdCheck
                            size={12}
                            color={COLOR_SUCCESS}
                        />
                    ) : (
                        <MdClose
                            size={12}
                            color={COLOR_UNSET}
                        />
                    )
                }
                checked={isEnabled === true}
                onChange={(event) => {
                    onToggle(event.currentTarget.checked);
                }}
            />
        </Group>
    );
};
