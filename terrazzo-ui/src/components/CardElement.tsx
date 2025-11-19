import { Group, Paper, Text } from '@mantine/core';
import { useInViewport } from '@mantine/hooks';
import { CardId } from '@mosaiq/terrazzo-common/types';
import { AvatarRow } from '@trz/components/AvatarRow';
import { PriorityChip } from '@trz/components/CardDetails/PriorityButtons';
import { getCardNumber } from '@trz/util/boardUtils';
import { useContextMenu } from 'mantine-contextmenu';
import React, { useEffect, useState } from 'react';
import { useCard } from '../hooks/useCard';
import { CardContextMenu } from './CardContextMenu';
import { LabelDisplay } from './CardDetails/LabelsMenu';

interface CardElementProps {
    cardId: CardId;
    dragging: boolean;
    isOverlay: boolean;
    boardCode: string;
    onClick: () => void;
}
const CardElement = (props: CardElementProps) => {
    const { ref: viewportRef, inViewport } = useInViewport();
    const card = useCard(props.cardId, props.dragging || props.isOverlay, inViewport);
    const { showContextMenu } = useContextMenu();

    const [hovered, setHovered] = useState(false);

    const onOpenCardModal = () => {
        if (!card || props.dragging || props.isOverlay) {
            return;
        }
        props.onClick();
    };

    useEffect(() => {
        if (props.dragging || props.isOverlay) {
            setHovered(true);
        } else {
            setHovered(false);
        }
    }, [props.dragging, props.isOverlay]);

    return (
        <Paper
            ref={viewportRef}
            bg="#1e2022"
            radius="md"
            p="sm"
            shadow="md"
            style={{
                cursor: 'pointer',
                marginInline: '5px',
                width: '230px',
                backgroundColor: hovered ? '#2a2c31' : '#1e2022',
                transition: `transform .1s, background-color .15s ease, box-shadow .1s, filter 0ms linear ${
                    props.dragging ? '0ms' : '225ms'
                }`,
                ...(props.dragging
                    ? props.isOverlay
                        ? {
                              transform: 'rotateZ(3deg) scale(1.02)',
                              boxShadow: '10px 8px 25px black',
                              border: '1px solid #14222e',
                              zIndex: 12,
                          }
                        : {
                              filter: 'grayscale(1) contrast(0) brightness(0) blur(6px)',
                              opacity: 0.4,
                              zIndex: 11,
                          }
                    : undefined),
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
                if (!props.dragging && !props.isOverlay) {
                    setHovered(false);
                }
            }}
            onClick={onOpenCardModal}
            onContextMenuCapture={showContextMenu((close) => (
                <CardContextMenu
                    cardId={props.cardId}
                    onClose={close}
                />
            ))}
        >
            {import.meta.env.DEBUG === 'true' && <Text fz="6pt">{props.cardId}</Text>}
            {card && inViewport && (
                <React.Fragment>
                    {card.labels.length > 0 && (
                        <div style={{marginBottom: '10px'}}>
                            <LabelDisplay
                                labels={card.labels}
                                size="xs"
                            />
                        </div>
                    )}
                    <Text
                        lineClamp={7}
                        c="#ffffff"
                        fz="sm"
                        style={{
                            wordWrap: 'break-word',
                            textWrap: 'wrap',
                            userSelect: 'none',
                        }}
                    >
                        {card.name}
                    </Text>
                    <Text
                        size="xs"
                        c="#878787"
                        style={{
                            userSelect: 'none',
                        }}
                    >
                        <div style={{"marginTop": '10px'}}>
                            {getCardNumber(props.boardCode, card.cardNumber)}
                        </div>
                    </Text>
                    <Group
                        justify="space-between"
                        style={{ flexDirection: 'row-reverse' }}
                    >
                        <AvatarRow
                            users={card.assignees}
                            maxUsers={3}
                        />
                        {card.priority && (
                            <div style={{marginTop: '10px'}}>
                                <PriorityChip priority={card.priority} size={"small"}/>
                            </div>
                        )}
                    </Group>
                </React.Fragment>
            )}
        </Paper>
    );
};
export default CardElement;
