import { StrikeExtension } from '@remirror/extension-strike';
import { useActive, useCommands } from '@remirror/react-core';
import { FC, useCallback } from 'react';
import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleStrikeButtonProps extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleStrikeButton: FC<ToggleStrikeButtonProps> = (props) => {
    const { toggleStrike } = useCommands<StrikeExtension>();

    const handleSelect = useCallback(() => {
        if (toggleStrike.enabled()) {
            toggleStrike();
        }
    }, [toggleStrike]);

    const active = useActive<StrikeExtension>().strike();
    const enabled = toggleStrike.enabled();

    return (
        <CommandButton
            {...props}
            commandName="toggleStrike"
            active={active}
            enabled={enabled}
            onSelect={handleSelect}
        />
    );
};
