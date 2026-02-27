import { Flex, Paper, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { useImageColor } from '@trz/hooks/util/useImageColor';
import React from 'react';

interface BoardListCardProps {
    bgColor: string;
    bgImage?: string;
    color: string;
    title: string;
    onClick: () => void;
    centered?: boolean;
}
export const BOARD_CARD_WIDTH = 250;
export const BoardListCard = (props: BoardListCardProps): React.JSX.Element => {
    const { hovered, ref } = useHover();
    const imageColor = useImageColor(props.bgImage, 'DarkMuted');

    return (
        <Paper
            ref={ref}
            bg={imageColor ?? props.bgColor}
            w={BOARD_CARD_WIDTH}
            h={0.44 * BOARD_CARD_WIDTH}
            radius="md"
            m="10"
            shadow={hovered ? 'lg' : 'sm'}
            onClick={props.onClick}
            style={{
                transition: 'filter 200ms, transform 200ms, box-shadow 200ms',
                transform: `translateY(${hovered ? -5 : 0}px)`,
                filter: `brightness(${hovered ? 0.75 : 1})`,
            }}
        >
            {props.centered && (
                <Flex
                    justify="center"
                    align="center"
                    h="100%"
                    w="100%"
                >
                    <Text
                        c={props.color}
                        fw={700}
                    >
                        {props.title}
                    </Text>
                </Flex>
            )}
            {!props.centered && (
                <Text
                    c={props.color}
                    p="10"
                >
                    {props.title}
                </Text>
            )}
        </Paper>
    );
};
