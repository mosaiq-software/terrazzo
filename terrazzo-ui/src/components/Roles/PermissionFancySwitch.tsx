import { Group, SegmentedControl, Stack, Text } from '@mantine/core';
import { COLOR_ERROR, COLOR_SUCCESS, COLOR_UNSET } from '@trz/util/colorUtils';
import { useCallback } from 'react';
import { MdCheck, MdClose, MdOutlineCircle } from 'react-icons/md';

interface PermissionFancySwitchProps {
    permissionName: string;
    permissionDescription: string;
    isEnabled: boolean | undefined;
    onToggle: (newState: boolean | undefined) => void;
}
export const PermissionFancySwitch = (props: PermissionFancySwitchProps) => {
    const { permissionName, permissionDescription, isEnabled, onToggle } = props;

    const handleChange = useCallback(
        (value: string) => {
            if (value === 'enabled') {
                onToggle(true);
            } else if (value === 'disabled') {
                onToggle(false);
            } else {
                onToggle(undefined);
            }
        },
        [onToggle]
    );

    const { value, color } = getValue(isEnabled);

    return (
        <Group
            wrap="nowrap"
            justify="space-between"
        >
            <Stack
                gap={0}
                flex={1}
            >
                <Text size="sm">{permissionName}</Text>
                <Text
                    size="sm"
                    c="dimmed"
                >
                    {permissionDescription}
                </Text>
            </Stack>
            <SegmentedControl
                data={[
                    { label: <MdClose />, value: 'disabled' },
                    { label: <MdOutlineCircle />, value: 'unset' },
                    { label: <MdCheck />, value: 'enabled' },
                ]}
                value={value}
                onChange={handleChange}
                color={color}
                withItemsBorders={false}
                styles={{
                    root: {
                        width: 'fit-content',
                    },
                    innerLabel: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4,
                    },
                    indicator: {
                        transitionProperty: 'transform, width, height, background-color',
                    },
                }}
            />
        </Group>
    );
};

const getValue = (isEnabled: boolean | undefined) => {
    if (isEnabled === true) {
        return { value: 'enabled', color: COLOR_SUCCESS };
    } else if (isEnabled === false) {
        return { value: 'disabled', color: COLOR_ERROR };
    } else {
        return { value: 'unset', color: COLOR_UNSET };
    }
};
