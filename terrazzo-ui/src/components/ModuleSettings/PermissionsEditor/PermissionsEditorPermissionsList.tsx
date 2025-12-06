import { Stack } from '@mantine/core';
import { OverridePermissions, PermissionFlag, PermissionFlagData, recordValues } from '@mosaiq/terrazzo-common';
import { PermissionFancySwitch } from '@trz/components/Roles/PermissionFancySwitch';

interface PermissionsEditorPermissionsListProps {
    rolePermissionsOverride: OverridePermissions;
    onChangeOverride: (newOverride: OverridePermissions) => void;
}
const AllPermissions = recordValues(PermissionFlag);
export const PermissionsEditorPermissionsList = (props: PermissionsEditorPermissionsListProps) => {
    return (
        <Stack
            gap={4}
            p="md"
        >
            {AllPermissions.map((permission) => {
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
            })}
        </Stack>
    );
};
