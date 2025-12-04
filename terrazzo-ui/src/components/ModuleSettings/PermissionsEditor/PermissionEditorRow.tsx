import { Box, ComboboxItem, Select, Tooltip } from '@mantine/core';
import { PermissionLevel } from '@mosaiq/terrazzo-common/types';
import { ActionRow } from '@trz/components/UI/ActionRow';
import { IconType } from 'react-icons';
import { MdPersonRemove } from 'react-icons/md';
import { permissionLevelOptions } from './PermissionsEditorShared';

interface PermissionEditorRowProps {
    title: string;
    subtitle?: string;
    icon?: string | IconType;
    permissionLevel: PermissionLevel;
    minimumPermissionLevel: PermissionLevel;
    disabled?: boolean;
    tooltip?: string;
    onChangeLevel: (newLevel: PermissionLevel) => void;
    onDeletePermission?: () => void;
}
export const PermissionEditorRow = (props: PermissionEditorRowProps) => {
    const data: ComboboxItem[] = permissionLevelOptions.map((value, index) => ({
        value: index.toString(),
        label: value.toString(),
        disabled: index < props.minimumPermissionLevel,
    }));

    return (
        <Tooltip
            label={props.tooltip}
            disabled={!props.tooltip}
            withArrow
            openDelay={300}
        >
            <Box>
                <ActionRow
                    icon={props.icon}
                    title={props.title}
                    subtitle={props.subtitle}
                    disabled={props.disabled}
                    bg="#2e2e2e"
                    items={[
                        <Select
                            key="permission-select"
                            label={props.minimumPermissionLevel ? `At least ${permissionLevelOptions[props.minimumPermissionLevel]} (inherited from parent directory)` : undefined}
                            disabled={props.disabled}
                            data={data}
                            value={props.permissionLevel.toString()}
                            onChange={(value) => {
                                const newLevel = Number(value) as PermissionLevel;
                                props.onChangeLevel(newLevel);
                            }}
                        />,
                    ]}
                    menuLabel="Manage Permission"
                    menuItems={
                        props.onDeletePermission && !props.disabled
                            ? [
                                  {
                                      label: 'Remove Explicit Permission',
                                      onClick: () => props.onDeletePermission?.(),
                                      icon: <MdPersonRemove size={16} />,
                                      color: 'red',
                                  },
                              ]
                            : []
                    }
                />
            </Box>
        </Tooltip>
    );
};
