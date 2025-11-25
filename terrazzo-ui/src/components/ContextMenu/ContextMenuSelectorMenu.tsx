import { Button, Menu, Stack } from '@mantine/core';
import { colorIsDarkAdvanced } from '@trz/util/colorUtils';
import React from 'react';
import { ContextMenuButton } from './ContextMenuButton';

const OPEN_DELAY = 100;
const CLOSE_DELAY = 100;
const DEFAULT_COLOR = '#242424';

export interface ContextMenuSelectorMenuItem<T = string> {
    id: T;
    label: string | React.ReactNode;
    color?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}
export interface ContextMenuSelectorMenuProps<T = string> {
    title: string;
    icon?: React.ReactNode;
    items: ContextMenuSelectorMenuItem<T>[];
    textColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    onSelect: (selected: T) => void;
}

export const ContextMenuSelectorMenu = <T extends string = string>(props: ContextMenuSelectorMenuProps<T>) => {
    return (
        <Menu
            position="right-start"
            withArrow
            arrowPosition="center"
            closeOnClickOutside={true}
            trigger="hover"
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
            withinPortal={false}
        >
            <Menu.Target>
                <ContextMenuButton
                    icon={props.icon}
                    text={props.title}
                    onClick={() => {
                        /* no-op */
                    }}
                />
            </Menu.Target>
            <Menu.Dropdown left={'105%'}>
                <Menu.Label>{props.title}</Menu.Label>
                <Stack gap={1}>
                    {props.items.map((item) => {
                        const textColor = props.textColor ?? (colorIsDarkAdvanced(item.color ?? DEFAULT_COLOR) ? '#fff' : '#000');
                        return (
                            <Button
                                key={item.id}
                                bg={item.color ?? DEFAULT_COLOR}
                                ta={props.textAlign ?? 'left'}
                                justify={props.textAlign === 'center' ? 'center' : props.textAlign === 'right' ? 'flex-end' : 'flex-start'}
                                c={textColor}
                                leftSection={item.leftIcon}
                                rightSection={item.rightIcon}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    props.onSelect(item.id);
                                }}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                </Stack>
            </Menu.Dropdown>
        </Menu>
    );
};
