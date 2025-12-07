import { Center, RingProgress, Tooltip, UnstyledButton } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { useEffect, useState } from 'react';

interface RingHoldingButtonProps {
    children?: any;
    durationMs: number;
    color?: string;
    onClick?: () => void;
    onEarlyRelease?: () => void;
    increment?: number;
    ringSize?: number;
    ringThickness?: number;
    tooltip?: string;
}
const DEFAULT_INCREMENT = 1000 / 60; // 60fps
export const RingHoldingButton = (props: RingHoldingButtonProps) => {
    const [holding, setHolding] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [clicked, setClicked] = useState<boolean>(false);

    const onComplete = () => {
        if (clicked) return;
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
    }, []);

    return (
        <Tooltip
            label={props.tooltip}
            withArrow
            disabled={!props.tooltip}
        >
            <UnstyledButton
                onMouseUp={release}
                onMouseLeave={release}
                onMouseDown={down}
                onClick={(e) => e.preventDefault()}
            >
                <RingProgress
                    size={props.ringSize}
                    thickness={props.ringThickness}
                    sections={[{ value: 100 * (progress / props.durationMs), color: props.color ?? 'white' }]}
                    label={<Center>{props.children}</Center>}
                />
            </UnstyledButton>
        </Tooltip>
    );
};
