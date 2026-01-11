import { Button, ButtonProps } from '@mantine/core';
import React, { forwardRef } from 'react';

interface ContextMenuButtonProps extends Omit<ButtonProps, 'children'> {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
}
export const ContextMenuButton = forwardRef<HTMLButtonElement, ContextMenuButtonProps>(
    ({ icon, text, onClick, ...otherProps }, ref) => {
        return (
            <Button
                ref={ref}
                w="100%"
                fullWidth
                justify="start"
                variant="subtle"
                c="white"
                leftSection={icon}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick();
                }}
                {...otherProps}
            >
                {text}
            </Button>
        );
    }
);

ContextMenuButton.displayName = 'ContextMenuButton';
