import { Box, Group, Tooltip, UnstyledButton } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { completelyCaptureEvent } from '@trz/util/eventUtils';
import { useEffect, useRef, useState } from 'react';

interface RectHoldingButtonProps {
    children?: React.ReactNode;
    durationMs: number;
    onClick?: () => void;
    onEarlyRelease?: () => void;
    increment?: number;
    width?: number | string;
    height?: number | string;
    borderThickness?: number;
    borderRadius?: number;
    borderColor?: string;
    defaultBorderColor?: string;
    backgroundColor?: string;
    style?: Omit<React.CSSProperties, 'width' | 'height' | 'borderRadius' | 'borderWidth'>;
    tooltip?: string;
    tooltipDelay?: number;
    disabled?: boolean;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
    variant?: 'filled' | 'outline';
}
const DEFAULT_INCREMENT = 1000 / 60; // 60fps
export const RectHoldingButton = (props: RectHoldingButtonProps) => {
    const [holding, setHolding] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [clicked, setClicked] = useState<boolean>(false);
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
        width: typeof props.width === 'number' ? props.width : 100,
        height: typeof props.height === 'number' ? props.height : 50,
    });
    const boxRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState<boolean>(false);

    const onComplete = () => {
        if (clicked || props.disabled) return;
        setClicked(true);
        if (props.onClick) props.onClick();
    };

    const release = () => {
        if (holding && progress < props.durationMs && props.onEarlyRelease) {
            props.onEarlyRelease();
        }
        setHolding(false);
        setClicked(false);
    };

    const down = () => {
        if (props.disabled) return;
        setHolding(true);
    };

    const interval = useInterval(() => {
        if (holding) {
            if (progress >= props.durationMs) {
                onComplete();
            }
            setProgress((s) => Math.min(s + (props.increment || DEFAULT_INCREMENT), props.durationMs));
        } else if (progress > 0) {
            setProgress((s) => Math.max(0, Math.pow(s, 0.95) - 3));
        }
    }, props.increment || DEFAULT_INCREMENT);

    useEffect(() => {
        interval.start();
        return interval.stop;
    }, [interval]);

    useEffect(() => {
        const updateDimensions = () => {
            if (boxRef.current) {
                const rect = boxRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });
            }
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (boxRef.current) {
            resizeObserver.observe(boxRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [props.children, props.width, props.height, props.borderRadius, props.borderThickness, props.style]);

    const borderRadius = props.borderRadius ?? 4;
    const strokeWidth = props.borderThickness ?? 1;
    const defaultBorderColor = props.defaultBorderColor || (props.variant === 'outline' ? 'white' : undefined);

    // Calculate the perimeter of the rounded rectangle
    const rectWidth = dimensions.width - strokeWidth;
    const rectHeight = dimensions.height - strokeWidth;
    const radius = Math.max(0, borderRadius - strokeWidth / 2);

    // Approximate perimeter: straight edges + arc lengths
    const straightPerimeter = 2 * Math.max(0, rectWidth - 2 * radius) + 2 * Math.max(0, rectHeight - 2 * radius);
    const arcPerimeter = 2 * Math.PI * radius;
    const totalPerimeter = straightPerimeter + arcPerimeter;

    const progressLength = (progress / props.durationMs) * totalPerimeter;

    return (
        <Tooltip
            label={props.tooltip}
            withArrow
            disabled={!props.tooltip}
            openDelay={props.tooltipDelay || 200}
        >
            <UnstyledButton
                onMouseUp={release}
                onMouseDown={down}
                onClick={(e) => e.preventDefault()}
                disabled={props.disabled}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => {
                    setHovered(false);
                    release();
                }}
                onFocus={(e) => {
                    completelyCaptureEvent(e);
                }}
            >
                <Box
                    ref={boxRef}
                    style={{
                        position: 'relative',
                        width: props.width,
                        height: props.height,
                        backgroundColor: props.backgroundColor || 'transparent',
                        padding: '8px 18px',
                        borderRadius,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                        opacity: props.disabled ? 0.5 : 1,
                        cursor: props.disabled ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        ...props.style,
                    }}
                >
                    <svg
                        width={dimensions.width}
                        height={dimensions.height}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            pointerEvents: 'none',
                            overflow: 'visible',
                            backgroundColor: hovered ? '#ffffff20' : 'transparent',
                            borderRadius: borderRadius,
                            transition: 'background-color 0.1s ease',
                            zIndex: 0,
                        }}
                    >
                        {defaultBorderColor && (
                            <rect
                                x={strokeWidth / 2}
                                y={strokeWidth / 2}
                                width={rectWidth}
                                height={rectHeight}
                                rx={radius}
                                ry={radius}
                                fill="none"
                                stroke={defaultBorderColor}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                            />
                        )}
                        <rect
                            x={strokeWidth / 2}
                            y={strokeWidth / 2}
                            width={rectWidth}
                            height={rectHeight}
                            rx={radius}
                            ry={radius}
                            fill="none"
                            stroke={props.borderColor || 'white'}
                            strokeWidth={strokeWidth}
                            strokeDasharray={totalPerimeter}
                            strokeDashoffset={totalPerimeter - progressLength}
                            strokeLinecap="round"
                        />
                    </svg>
                    <Group
                        gap={8}
                        align="center"
                        wrap="nowrap"
                        fz="inherit"
                        style={{ position: 'relative', zIndex: 1 }}
                    >
                        {props.leftSection}
                        {props.children}
                        {props.rightSection}
                    </Group>
                </Box>
            </UnstyledButton>
        </Tooltip>
    );
};
