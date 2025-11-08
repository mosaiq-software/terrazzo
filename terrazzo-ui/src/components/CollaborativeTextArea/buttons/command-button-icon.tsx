import { Badge } from '@mantine/core';
import { CommandUiIcon, CoreIcon, isPlainObject, isString } from '@remirror/core';
import { Icon } from '@remirror/react-components';
import React, { FC, ReactNode } from 'react';

const isCommandUiIcon = (val: unknown): val is CommandUiIcon => {
    if (!isPlainObject(val)) {
        return false;
    }

    return !!val.name;
};

export interface CommandButtonIconProps {
    icon: CoreIcon | JSX.Element | null;
}

export const CommandButtonIcon: FC<CommandButtonIconProps> = ({ icon }) => {
    if (isString(icon)) {
        return (
            <Icon
                name={icon}
                size="1rem"
            />
        );
    }

    return icon;
};

export interface CommandButtonBadgeProps {
    icon?: CommandUiIcon | CoreIcon | JSX.Element | null;
    children: ReactNode;
}

export const CommandButtonBadge: FC<CommandButtonBadgeProps> = ({ icon, children }) => {
    if (!isCommandUiIcon(icon)) {
        return children as React.ReactElement;
    }

    const { sub, sup } = icon;
    const value = sub ?? sup;
    const isBottom = sub !== undefined;

    if (value === undefined) {
        return children as React.ReactElement;
    }

    return (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
            {children}
            <Badge
                color="gray"
                size="xs"
                variant="filled"
                style={{
                    position: 'absolute',
                    top: isBottom ? 'auto' : '-4px',
                    bottom: isBottom ? '-4px' : 'auto',
                    right: '-4px',
                    minWidth: '12px',
                    height: '12px',
                    fontSize: '8px',
                    padding: '1px 3px',
                }}
            >
                {value}
            </Badge>
        </div>
    );
};
