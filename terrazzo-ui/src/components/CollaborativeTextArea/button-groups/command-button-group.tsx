import { Box } from '@mantine/core';
import type { FC, ReactNode } from 'react';

export interface CommandButtonGroupProps {
    children: ReactNode | ReactNode[];
}

export const CommandButtonGroup: FC<CommandButtonGroupProps> = (props) => (
    <Box
        style={{
            display: 'flex',
            alignItems: 'center',
            width: 'fit-content',
        }}
        {...props}
    />
);
