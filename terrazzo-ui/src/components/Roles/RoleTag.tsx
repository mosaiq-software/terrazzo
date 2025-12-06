import { Box, Text } from '@mantine/core';
import { Role } from '@mosaiq/terrazzo-common';
import { colorIsDarkAdvanced } from '@trz/util/colorUtils';
import { useState } from 'react';
import { MdClose } from 'react-icons/md';

interface RoleTagProps {
    role: Role;
    onRemove?: () => void;
    variant?: 'tag' | 'item';
}
export const RoleTag = (props: RoleTagProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const iconColor = colorIsDarkAdvanced(props.role.color) ? '#fff' : '#000';
    const variant = props.variant ?? 'tag';

    return (
        <Box
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: variant === 'tag' ? '3px 8px' : '6px 12px',
                borderRadius: variant === 'tag' ? '12px' : '0px',
                border: variant === 'tag' ? '1px solid #373A40' : 'none',
                backgroundColor: variant === 'item' && isHovered ? '#00000010' : 'transparent',
                width: variant === 'item' ? '100%' : 'auto',
                transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Box
                style={{
                    width: 12,
                    height: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <Box
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: props.role.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        props.onRemove?.();
                    }}
                >
                    {props.onRemove && isHovered && (
                        <MdClose
                            size={8}
                            color={iconColor}
                        />
                    )}
                </Box>
            </Box>
            <Text
                size="xs"
                style={{
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    fontSize: '12px',
                }}
            >
                {props.role.name}
            </Text>
        </Box>
    );
};
