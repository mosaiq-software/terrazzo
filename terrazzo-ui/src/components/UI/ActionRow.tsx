import { ActionIcon, Avatar, Box, Group, Menu, Text } from '@mantine/core';
import { COLORS } from '@trz/util/colors';
import { IconType } from 'react-icons';
import { HiDotsVertical } from 'react-icons/hi';
import { RectHoldingButton } from './RectHoldingButton';

export interface ActionRowMenuItem {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    color?: string;
    disabled?: boolean;
    longHold?: boolean;
}

interface ActionRowProps {
    icon?: string | IconType;
    iconColor?: string;
    title: string;
    subtitle?: string;
    items?: React.ReactNode[];
    menuLabel?: string;
    menuItems?: ('-' | ActionRowMenuItem)[];
    disabled?: boolean;
    bg?: string;
}

export const ActionRow = (props: ActionRowProps) => {
    const iconIsString = typeof props.icon === 'string';
    return (
        <Group
            w="100%"
            px="md"
            py="sm"
            bg={props.bg || COLORS.background.medium}
            style={{
                borderRadius: '8px',
                opacity: props.disabled ? 0.5 : 1,
            }}
            justify="space-between"
            wrap="nowrap"
        >
            <Group
                gap="md"
                wrap="nowrap"
                style={{ flex: 1, overflow: 'hidden' }}
            >
                {iconIsString ? (
                    <Avatar
                        src={props.icon as string}
                        size={40}
                        radius="xl"
                        name={props.title}
                        color={'initials'}
                    />
                ) : (
                    <Box
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: props.iconColor || COLORS.accent.teal.dark,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {props.icon &&
                            typeof props.icon === 'function' &&
                            props.icon({
                                size: 20,
                                color: props.iconColor || COLORS.accent.teal.light,
                            })}
                    </Box>
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Group gap="xs">
                        <Text
                            c={COLORS.text.primary}
                            fw={500}
                            size="sm"
                            style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {props.title}
                        </Text>{' '}
                    </Group>
                    <Text
                        c={COLORS.text.muted}
                        size="xs"
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {props.subtitle}
                    </Text>
                </div>
            </Group>

            <Group
                gap="sm"
                wrap="nowrap"
            >
                {props.items?.map((item, index) => (
                    <Box key={index}>{item}</Box>
                ))}
                {props.menuItems && props.menuItems.length > 0 && (
                    <Menu
                        position="bottom-end"
                        withArrow
                        shadow="md"
                    >
                        <Menu.Target>
                            <ActionIcon
                                variant="subtle"
                                c={COLORS.text.primary}
                                size="lg"
                            >
                                <HiDotsVertical size={18} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>{props.menuLabel}</Menu.Label>
                            {props.menuItems?.map((item, index) => {
                                if (item === '-') {
                                    return <Menu.Divider key={index} />;
                                }
                                if (item.longHold) {
                                    return (
                                        <RectHoldingButton
                                            key={index}
                                            leftSection={item.icon}
                                            onClick={item.onClick}
                                            disabled={item.disabled}
                                            durationMs={2000}
                                            width="100%"
                                            backgroundColor={COLORS.transparent}
                                            borderColor={item.color || COLORS.text.primary}
                                            style={{
                                                fontSize: '14px',
                                                padding: '8px 12px',
                                                justifyContent: 'center',
                                            }}
                                            borderRadius={4}
                                        >
                                            {item.label}
                                        </RectHoldingButton>
                                    );
                                }
                                return (
                                    <Menu.Item
                                        key={index}
                                        color={item.color}
                                        leftSection={item.icon}
                                        onClick={item.onClick}
                                        disabled={item.disabled}
                                    >
                                        {item.label}
                                    </Menu.Item>
                                );
                            })}
                        </Menu.Dropdown>
                    </Menu>
                )}
            </Group>
        </Group>
    );
};
