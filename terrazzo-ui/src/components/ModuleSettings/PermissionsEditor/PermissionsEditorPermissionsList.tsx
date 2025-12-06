import { Divider, Group, Stack, Title } from '@mantine/core';
import { OverridePermissions, PermissionFlagData } from '@mosaiq/terrazzo-common';
import { PermissionFancySwitch } from '@trz/components/Roles/PermissionFancySwitch';
import { PermissionFlagGrouper } from '@trz/components/Roles/PermissionFlagGroupper';
import { RingHoldingButton } from '@trz/components/UI/RingHoldingButton';
import { MdOutlineDelete } from 'react-icons/md';

interface PermissionsEditorPermissionsListProps {
    rolePermissionsOverride: OverridePermissions;
    onChangeOverride: (newOverride: OverridePermissions) => void;
    onRemoveOverride: () => void;
}
export const PermissionsEditorPermissionsList = (props: PermissionsEditorPermissionsListProps) => {
    return (
        <Stack
            gap={4}
            p="md"
        >
            <PermissionFlagGrouper
                permissionItem={(permission) => {
                    const permData = PermissionFlagData[permission];
                    const state = props.rolePermissionsOverride[permission];
                    return (
                        <PermissionFancySwitch
                            key={permission}
                            permissionName={permData.title}
                            permissionDescription={permData.description}
                            isEnabled={state}
                            onToggle={(newState: boolean | undefined) => {
                                props.onChangeOverride({
                                    ...props.rolePermissionsOverride,
                                    [permission]: newState,
                                });
                            }}
                        />
                    );
                }}
            />
            <Divider />
            <Title order={5}>Danger Zone</Title>
            <Group>
                <RingHoldingButton
                    tooltip="Hold to remove role permissions override"
                    durationMs={1000}
                    ringSize={50}
                    ringThickness={6}
                    color="red"
                    onClick={() => {
                        props.onRemoveOverride();
                    }}
                >
                    <MdOutlineDelete />
                </RingHoldingButton>
            </Group>
        </Stack>
    );
};
