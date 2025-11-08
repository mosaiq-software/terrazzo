import React, { useEffect, useState } from 'react';
import ListElement from '@trz/components/ListElement';
import { CSS, Transform } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { CardId, ListId } from '@mosaiq/terrazzo-common/types';
import { DraggableAttributes, useDroppable } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface SortableListProps {
    listId: ListId;
    onClickCard: (card: CardId) => void;
    boardCode: string;
}
function SortableList(props: SortableListProps): React.JSX.Element {
    const [initialPosition, setInitialPosition] = useState<DOMRect | undefined>(undefined);

    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef: sortableSetNodeRef,
        transition,
        transform,
        node,
        setActivatorNodeRef,
    } = useSortable({
        id: props.listId,
        data: { type: 'list' },
    });

    const { setNodeRef: droppableSetNodeRef } = useDroppable({
        id: props.listId,
    });

    useEffect(() => {
        if (node.current) {
            setInitialPosition(node.current.getBoundingClientRect());
        }
    }, [node]);

    const otherDraggingPos = null; //sockCtx.roomUsers.find((ru)=>ru.mouseRoomData?.draggingList === props.listType.id)?.mouseRoomData?.pos;
    let listTransform: Transform | null = transform;
    if (listTransform) {
        listTransform.scaleY = 1;
    } else if (otherDraggingPos && initialPosition) {
        listTransform = {
            x: 0, //otherDraggingPos.x - initialPosition.x - (initialPosition.width / 2),
            y: 0,
            scaleX: 1,
            scaleY: 1,
        };
    }

    return (
        <div
            ref={sortableSetNodeRef}
            style={{
                transform: CSS.Transform.toString(listTransform),
                transition: transition,
                zIndex: isDragging || !!otherDraggingPos ? 100 : undefined,
            }}
        >
            <MemoRenderList
                boardCode={props.boardCode}
                listId={props.listId}
                isDragging={isDragging}
                setActivatorNodeRef={setActivatorNodeRef}
                listeners={listeners}
                attributes={attributes}
                otherDraggingPos={otherDraggingPos}
                droppableSetNodeRef={droppableSetNodeRef}
                onClickCard={props.onClickCard}
            />
        </div>
    );
}
export default SortableList;

interface RenderListProps {
    listId: ListId;
    boardCode: string;
    isDragging: boolean;
    setActivatorNodeRef: (element: HTMLElement | null) => void;
    listeners: SyntheticListenerMap | undefined;
    attributes: DraggableAttributes;
    otherDraggingPos: any;
    droppableSetNodeRef: (element: HTMLElement | null) => void;
    onClickCard: (card: CardId) => void;
}
const RenderList = (props: RenderListProps) => {
    return (
        <ListElement
            listId={props.listId}
            dragging={props.isDragging || !!props.otherDraggingPos}
            handleProps={{ ref: props.setActivatorNodeRef, ...props.listeners, ...props.attributes }}
            droppableSetNodeRef={props.droppableSetNodeRef}
            isOverlay={!!props.otherDraggingPos}
            onClickCard={props.onClickCard}
            boardCode={props.boardCode}
        />
    );
};

const MemoRenderList = React.memo(RenderList, (prev, next) => {
    return prev.boardCode === next.boardCode && prev.listId === next.listId && prev.isDragging === next.isDragging;
});
