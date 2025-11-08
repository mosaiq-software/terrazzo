import { CodeExtension } from '@remirror/extension-code';
import { useActive, useCommands } from '@remirror/react-core';
import { FC, useCallback } from 'react';
import { CommandButton, CommandButtonProps } from './command-button';

export interface ToggleCodeButtonProps extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const ToggleCodeButton: FC<ToggleCodeButtonProps> = (props) => {
    const { toggleCode } = useCommands<CodeExtension>();

    const handleSelect = useCallback(() => {
        if (toggleCode.enabled()) {
            toggleCode();
        }
    }, [toggleCode]);

    const active = useActive<CodeExtension>().code();
    const enabled = toggleCode.enabled();

    return (
        <CommandButton
            {...props}
            commandName="toggleCode"
            active={active}
            enabled={enabled}
            onSelect={handleSelect}
        />
    );
};
