import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardId } from '@mosaiq/terrazzo-common/types';
import CardElement from '@trz/components/CardElement';
import { useSocket } from '@trz/contexts/socket-context';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface SortableCardProps {
    cardId: CardId;
    listDragging: boolean;
    boardCode: string;
    onClick: () => void;
}
function SortableCard(props: SortableCardProps): React.JSX.Element {
    const sockCtx = useSocket();
    const [initialPosition, setInitialPosition] = useState<DOMRect | undefined>(undefined);

    const { attributes, isDragging, listeners, setNodeRef, transform, node } = useSortable({
        id: props.cardId,
        data: { type: 'card' },
    });

    useEffect(() => {
        if (node.current) {
            setInitialPosition(node.current.getBoundingClientRect());
        }
    }, [node]);

    const otherDraggingPos = null; //sockCtx.roomUsers.find((ru)=>ru.mouseRoomData?.draggingCard === props.card.id)?.mouseRoomData?.pos;
    if (!!otherDraggingPos && initialPosition) {
        return createPortal(
            <div
                style={{
                    position: 'absolute',
                    // left: otherDraggingPos.x,
                    // top: otherDraggingPos.y,
                    zIndex: 101,
                }}
            >
                <CardElement
                    cardId={props.cardId}
                    dragging={true}
                    isOverlay={true}
                    boardCode={props.boardCode}
                    onClick={props.onClick}
                />
            </div>,
            document.body
        );
    }

    return (
        <div
            ref={props.listDragging ? undefined : setNodeRef}
            {...attributes}
            {...listeners}
            style={{
                transform: transform ? CSS.Transform.toString({ ...transform, scaleY: 1, scaleX: 1 }) : undefined,
                zIndex: isDragging ? 101 : undefined,
            }}
        >
            <MemoRenderCard
                cardId={props.cardId}
                isDragging={isDragging}
                isOverlay={props.listDragging}
                boardCode={props.boardCode}
                onClick={props.onClick}
            />
        </div>
    );
}
export default SortableCard;

interface RenderCardProps {
    cardId: CardId;
    boardCode: string;
    onClick: () => void;
    isDragging: boolean;
    isOverlay: boolean;
}
const RenderCard = (props: RenderCardProps) => {
    return (
        <CardElement
            cardId={props.cardId}
            dragging={props.isDragging}
            isOverlay={props.isOverlay}
            boardCode={props.boardCode}
            onClick={props.onClick}
        />
    );
};

const MemoRenderCard = React.memo(RenderCard, (prev, next) => {
    return prev.boardCode === next.boardCode && prev.cardId === next.cardId && prev.isDragging === next.isDragging;
});
