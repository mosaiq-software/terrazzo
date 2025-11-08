import { Box, Button, ButtonProps, Tooltip } from '@mantine/core';
import React, { FC, MouseEvent, MouseEventHandler, ReactNode, useCallback } from 'react';
import { CoreIcon, isString } from '@remirror/core';

import { useCommandOptionValues, UseCommandOptionValuesParams } from '../use-command-option-values';
import { CommandButtonBadge, CommandButtonIcon } from './command-button-icon';

export interface CommandButtonProps extends Omit<ButtonProps, 'value' | 'aria-label' | 'onClick'>, Omit<UseCommandOptionValuesParams, 'active' | 'attrs'> {
    active?: UseCommandOptionValuesParams['active'];
    'aria-label'?: string;
    label?: NonNullable<ReactNode>;
    commandName: string;
    displayShortcut?: boolean;
    onSelect: () => void;
    icon?: CoreIcon | JSX.Element;
    attrs?: UseCommandOptionValuesParams['attrs'];
}

export const CommandButton: FC<CommandButtonProps> = ({ commandName, active = false, enabled, attrs, onSelect, icon, displayShortcut = true, 'aria-label': ariaLabel, label, ...rest }) => {
    const handleClick = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            onSelect();
        },
        [onSelect]
    );

    const handleMouseDown: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
        e.preventDefault();
    }, []);

    const commandOptions = useCommandOptionValues({ commandName, active, enabled, attrs });

    let fallbackIcon: CoreIcon | null = null;

    if (commandOptions.icon) {
        fallbackIcon = isString(commandOptions.icon) ? commandOptions.icon : commandOptions.icon.name;
    }

    const labelText = ariaLabel ?? commandOptions.label ?? '';
    const tooltipText = label ?? labelText;
    const shortcutText = displayShortcut && commandOptions.shortcut ? ` (${commandOptions.shortcut})` : '';

    return (
        <Tooltip label={`${tooltipText}${shortcutText}`}>
            <Box
                component="span"
                style={{ marginLeft: '-1px' }}
            >
                <Button
                    aria-label={labelText}
                    variant={active ? 'filled' : 'subtle'}
                    disabled={!enabled}
                    onMouseDown={handleMouseDown}
                    onClick={handleClick}
                    size="xs"
                    color="white"
                    style={{
                        opacity: enabled ? 1 : 0.5,
                        backgroundColor: active ? '#3f84c0ff' : '#323a40',
                    }}
                    {...rest}
                >
                    <CommandButtonBadge icon={commandOptions.icon}>
                        <CommandButtonIcon icon={icon ?? fallbackIcon} />
                    </CommandButtonBadge>
                </Button>
            </Box>
        </Tooltip>
    );
};
