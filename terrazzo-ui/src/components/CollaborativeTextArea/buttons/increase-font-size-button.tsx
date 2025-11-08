import { FontSizeExtension } from '@remirror/extension-font-size';
import { useCommands } from '@remirror/react-core';
import { FC, useCallback } from 'react';

import { CommandButton, CommandButtonProps } from './command-button';

export interface IncreaseFontSizeButtonProps extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const IncreaseFontSizeButton: FC<IncreaseFontSizeButtonProps> = (props) => {
    const { increaseFontSize } = useCommands<FontSizeExtension>();

    const handleSelect = useCallback(() => {
        if (increaseFontSize.enabled()) {
            increaseFontSize();
        }
    }, [increaseFontSize]);

    const enabled = increaseFontSize.enabled();

    return (
        <CommandButton
            {...props}
            commandName="increaseFontSize"
            enabled={enabled}
            onSelect={handleSelect}
        />
    );
};
