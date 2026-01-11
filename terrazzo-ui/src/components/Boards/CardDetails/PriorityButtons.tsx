import { Button, Center, Flex, Menu } from '@mantine/core';
import { Card, Priority } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateCardField } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import React from 'react';
import { MdOutlineRadioButtonUnchecked, MdRadioButtonChecked } from 'react-icons/md';
import {
    PiCellSignalFullFill,
    PiCellSignalLowFill,
    PiCellSignalMediumFill,
    PiCellSignalNoneDuotone,
} from 'react-icons/pi';

export const priorityColors: string[] = ['#817d7eff', '#e6abb9ff', '#ee809bff', '#fd2d61ff'];

export const PriorityIcons = {
    0: PiCellSignalNoneDuotone,
    [Priority.LOW]: PiCellSignalLowFill,
    [Priority.MEDIUM]: PiCellSignalMediumFill,
    [Priority.HIGH]: PiCellSignalFullFill,
};

export const prioNames = {
    0: 'Unset',
    [Priority.LOW]: 'Low',
    [Priority.MEDIUM]: 'Medium',
    [Priority.HIGH]: 'High',
};

interface PriorityButtonsProps {
    card: Card;
    viewOnly?: boolean;
}
export const PriorityButtons = (props: PriorityButtonsProps): React.JSX.Element => {
    const priority = props.card.priority ?? 0;
    const sockCtx = useSocket();

    const handleOnChange = async (newPriority: Priority) => {
        if (!props.card.id) {
            return;
        }
        try {
            await updateCardField(sockCtx, props.card.id, { priority: newPriority });
        } catch (e) {
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
    };

    return (
        <Menu
            position="bottom"
            withArrow
            arrowPosition="center"
            closeOnClickOutside={true}
            trigger="hover"
            closeDelay={200}
            disabled={props.viewOnly}
        >
            <Menu.Target>
                {props.viewOnly ? (
                    <Center p="sm">
                        <PriorityChip priority={priority} />
                    </Center>
                ) : (
                    <Button
                        variant="subtle"
                        justify={'flex-start'}
                    >
                        <PriorityChip priority={priority} />
                    </Button>
                )}
            </Menu.Target>
            <Menu.Dropdown>
                <Flex
                    direction="column-reverse"
                    align="center"
                    gap={1}
                >
                    {priorityColors.map((color, index) => {
                        return (
                            <Button
                                key={index}
                                bg={color}
                                ta={'center'}
                                justify={'center'}
                                c={'#fff'}
                                leftSection={
                                    priority === index ? (
                                        <MdRadioButtonChecked size={16} />
                                    ) : (
                                        <MdOutlineRadioButtonUnchecked size={16} />
                                    )
                                }
                                onClick={() => {
                                    handleOnChange(index);
                                }}
                            >
                                {PriorityIcons[index]({ size: 16 })}
                            </Button>
                        );
                    })}
                    <Menu.Label>Card Priority</Menu.Label>
                </Flex>
            </Menu.Dropdown>
        </Menu>
    );
};

interface PriorityChipProps {
    priority: number | null | undefined;
}
export const PriorityChip = (props: PriorityChipProps) => {
    const p = Math.max(0, Math.min(props.priority ?? 0, priorityColors.length - 1));
    return <Flex>{PriorityIcons[p]({ size: 16, color: priorityColors[p] })}</Flex>;
};
