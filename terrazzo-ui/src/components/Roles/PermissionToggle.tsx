import { Group, Stack, Switch, Text } from '@mantine/core';
import { COLORS } from '@trz/util/colors';
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
                    c={COLORS.text.muted}
                >
                    {permissionDescription}
                </Text>
            </Stack>
            <Switch
                color={COLORS.semantic.success}
                size="md"
                thumbIcon={
                    isEnabled ? (
                        <MdCheck
                            size={12}
                            color={COLORS.semantic.success}
                        />
                    ) : (
                        <MdClose
                            size={12}
                            color={COLORS.semantic.unset}
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
