import { Group, Paper, Text } from '@mantine/core';
import { useInViewport } from '@mantine/hooks';
import { CardId } from '@mosaiq/terrazzo-common';
import { AvatarRow } from '@trz/components/UI/AvatarRow';
import { useBoardMetadata } from '@trz/pages/BoardPage';
import { getCardNumber } from '@trz/util/boardUtils';
import { useContextMenu } from 'mantine-contextmenu';
import React from 'react';
import { useCard } from '../../hooks/useCard';
import { CardContextMenu } from './CardDetails/CardContextMenu';
import { LabelDisplay } from './CardDetails/LabelsMenu';
import { PriorityChip } from './CardDetails/PriorityButtons';

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
    const boardMeta = useBoardMetadata();
    const { editCard } = boardMeta.permissions;

    const onOpenCardModal = () => {
        if (!card || props.dragging || props.isOverlay) {
            return;
        }
        props.onClick();
    };

    return (
        <Paper
            ref={viewportRef}
            bg="#17191b"
            radius="md"
            p="sm"
            shadow="md"
            mih="85px"
            style={{
                cursor: 'pointer',
                marginInline: '5px',
                width: '230px',
                transition: `transform .1s, box-shadow .1s, filter 0ms linear ${props.dragging ? '0ms' : '225ms'}`,
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
            onClick={onOpenCardModal}
            onContextMenu={
                editCard
                    ? showContextMenu((close) => (
                          <CardContextMenu
                              cardId={props.cardId}
                              onClose={close}
                              boardLabels={boardMeta.labels}
                          />
                      ))
                    : undefined
            }
        >
            {import.meta.env.DEBUG === 'true' && <Text fz="6pt">{props.cardId}</Text>}
            {card && inViewport && (
                <React.Fragment>
                    <LabelDisplay
                        labels={card.labels}
                        size="xs"
                        boardLabels={boardMeta.labels}
                    />
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
                        {getCardNumber(props.boardCode, card.cardNumber)}
                    </Text>
                    <Group
                        justify="space-between"
                        align="flex-end"
                        style={{ flexDirection: 'row-reverse' }}
                    >
                        <AvatarRow
                            users={card.assignees}
                            maxUsers={3}
                            showProfilePopover={!props.dragging && !props.isOverlay}
                            showTooltip={!props.dragging && !props.isOverlay}
                            animateOnHover
                        />
                        <PriorityChip priority={card.priority} />
                    </Group>
                </React.Fragment>
            )}
        </Paper>
    );
};
export default CardElement;
