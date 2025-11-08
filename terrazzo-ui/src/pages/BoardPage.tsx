import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container } from '@mantine/core';
import CollaborativeMouseTracker from '@trz/wrappers/collaborativeMouseTracker';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '@trz/contexts/socket-context';
import CreateList from '@trz/components/CreateList';
import { BoardHeader, BoardId, Card, CardId, ListId, UID } from '@mosaiq/terrazzo-common/types';
import { NoteType, notify } from '@trz/util/notifications';
import SortableList from '@trz/components/DragAndDrop/SortableList';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, CollisionDetection, MeasuringStrategy, DragOverlay } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { DragAbortEvent, DragCancelEvent, DragOverEvent } from '@dnd-kit/core/dist/types';
import { createPortal } from 'react-dom';
import { boardDropAnimation, horizontalCollisionDetection, renderListDragOverlay, renderCardDragOverlay } from '@trz/util/dragAndDropUtils';
import CardDetails from '@trz/components/CardDetails/CardDetails';
import { NotFound, PageErrors } from '@trz/components/NotFound';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { createList, emitMoveCard, emitMoveList, getBoardData, getCardData, getListData } from '@trz/emitters/all';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { arrayMoveInPlace, updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { useRoom } from '@trz/hooks/useRoom';
import { useMap } from '@trz/hooks/useMap';
import { CARD_CACHE_PREFIX, LIST_CACHE_PREFIX } from '@trz/util/boardUtils';
import { setTitle } from '@trz/util/tabUtils';

interface BoardContextType {
    listToCardsMap: Map<ListId, CardId[]>;
}
export const BoardContext = createContext<BoardContextType | undefined>(undefined);

const BoardPage = (): React.JSX.Element => {
    const [boardData, setBoardData] = useState<BoardHeader | undefined>();
    const [draggingObject, setDraggingObject] = useState<{ list?: ListId; card?: CardId }>({});
    const [activeObject, setActiveObject] = useState<ListId | CardId | null>(null);
    const [openedCard, setOpenedCard] = useState<CardId | undefined>();
    const lastOverId = useRef<string | null>(null);
    const params = useParams();
    const [boardId, setBoardId] = useState<BoardId>(params.boardId as BoardId);
    const cardId = params.cardId as CardId;
    const sockCtx = useSocket();
    const trz = useTRZ();
    const navigate = useNavigate();
    const [listToCardsMap, setListMap] = useMap<ListId, CardId[]>();
    const [cardToListMap, setCardMap] = useMap<CardId, ListId>();
    const listKeys = Array.from(listToCardsMap.keys());
    useRoom(RoomType.DATA, boardId, false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchBoardData = async () => {
            if (!boardId && !cardId) {
                console.error('No boardId or cardId found in url');
                return;
            }
            try {
                let boardIdToUse = boardId;
                if (!boardIdToUse || (cardId && !openedCard)) {
                    // If no boardId, fetch it from the cardId
                    const cardRes = await getCardData(sockCtx, cardId);
                    if (!cardRes) {
                        console.error('No card data found for cardId in url:', cardId);
                        return;
                    }
                    const listRes = await getListData(sockCtx, cardRes.listId);
                    if (!listRes) {
                        console.error('No list data found for listId of card:', cardRes.listId);
                        return;
                    }
                    boardIdToUse = listRes.boardId;
                    setBoardId(listRes.boardId);
                }

                const boardRes = await getBoardData(sockCtx, boardIdToUse);
                setBoardData(boardRes);

                if (!boardRes) {
                    console.error('No board data found for boardId:', boardIdToUse);
                    return;
                }
                if (!cardId) {
                    setTitle(`${boardRes.name} | Terrazzo`);
                }

                const tempListMap = new Map<ListId, CardId[]>();
                const tempCardMap = new Map<CardId, ListId>();
                for (const list of boardRes.lists) {
                    const cardIds: CardId[] = [];
                    for (const card of list.cardIds) {
                        tempCardMap.set(card, list.listId);
                        cardIds.push(card);

                        // Opens corresponding card if url contains the cardId
                        if (card === cardId) {
                            setOpenedCard(card);
                        }
                    }
                    tempListMap.set(list.listId, cardIds);
                }
                setListMap(tempListMap);
                setCardMap(tempCardMap);

                // clear the previous cached boards
                const toRemove: string[] = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key?.startsWith(CARD_CACHE_PREFIX) || key?.startsWith(LIST_CACHE_PREFIX)) {
                        toRemove.push(key);
                    }
                }
                for (const key of toRemove) {
                    sessionStorage.removeItem(key);
                }

                // set the board header in the TRZ context
                trz.setBoardData(boardRes);
            } catch (err) {
                notify(NoteType.BOARD_DATA_ERROR, err);
                return;
            }
        };
        fetchBoardData();
        return () => {
            // clear the board header when leaving the page
            trz.setBoardData(undefined);
        };
    }, [boardId, sockCtx.connected, cardId]);

    useSocketListener<ServerSE.UPDATE_BOARD_FIELD>(ServerSE.UPDATE_BOARD_FIELD, (payload) => {
        setBoardData((prev) => {
            if (!prev) {
                return prev;
            }
            return { ...updateBaseFromPartial<BoardHeader>(prev, payload) };
        });
    });

    useSocketListener<ServerSE.ADD_LIST>(ServerSE.ADD_LIST, (payload) => {
        if (payload.boardId !== boardId) {
            return;
        }
        listToCardsMap.set(payload.id, []);
    });

    useSocketListener<ServerSE.ADD_CARD>(ServerSE.ADD_CARD, (payload) => {
        if (!listToCardsMap.has(payload.listId)) {
            console.warn('Tried to add a card to an non-existent list');
            return;
        }
        cardToListMap.set(payload.id, payload.listId);
        const list = listToCardsMap.get(payload.listId);
        if (list) {
            list.push(payload.id);
            listToCardsMap.set(payload.listId, list);
        }
    });

    useSocketListener<ServerSE.MOVE_LIST>(ServerSE.MOVE_LIST, (payload) => {
        moveListToPos(payload.listId, payload.position);
    });

    useSocketListener<ServerSE.MOVE_CARD>(ServerSE.MOVE_CARD, (payload) => {
        moveCardToListAndPos(payload.cardId, payload.toList, payload.position);
    });

    const openModal = useCallback((card: CardId) => {
        window.history.replaceState(null, '', `/card/${card}`);
        setOpenedCard(card);
    }, []);

    const closeModal = useCallback(() => {
        window.history.replaceState(null, '', `/board/${boardId}`);
        setOpenedCard(undefined);
    }, [boardId]);

    const memoizedSortableLists = useMemo(() => {
        return listKeys.map((id) => (
            <MemoRenderSortableList
                key={id}
                boardCode={boardData?.boardCode ?? ''}
                listId={id}
                onClickCard={openModal}
            />
        ));
    }, [listKeys.join(), boardData?.boardCode]);

    const moveListToPos = useCallback((listId: ListId, position: number) => {
        const list = listToCardsMap.get(listId);
        if (!list) {
            console.error('List not found', listId);
            return;
        }

        const entries = Array.from(listToCardsMap.entries());
        const index = entries.findIndex((l) => l[0] === listId);
        if (index < 0) {
            console.error('Error moving list, list not found in prev lists');
            return;
        }
        arrayMoveInPlace(entries, index, position);
        setListMap(entries);
    }, []);

    const moveCardToListAndPos = useCallback((cardId: CardId, toList: ListId, position?: number) => {
        const currentListId = cardToListMap.get(cardId);
        if (!currentListId) {
            throw new Error('a Card not in any list');
        }
        let currentListCards = listToCardsMap.get(currentListId);
        if (!currentListCards) {
            throw new Error('a Current list not found');
        }
        currentListCards = currentListCards.filter((c) => c !== cardId);

        let newListCards = listToCardsMap.get(toList);
        if (currentListId === toList) {
            newListCards = currentListCards;
        }
        if (!newListCards) {
            throw new Error('a No new list found');
        }
        if (position !== undefined) {
            newListCards.splice(position, 0, cardId);
        } else {
            newListCards.push(cardId);
        }

        listToCardsMap.set(toList, newListCards);
        listToCardsMap.set(currentListId, currentListCards);
        cardToListMap.set(cardId, toList);
    }, []);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const activeId = event.active.id.toString() as UID;
        if (listToCardsMap.has(activeId)) {
            // is dragging list
            setActiveObject(activeId);
            setDraggingObject({ list: activeId });
        } else {
            // is dragging card
            setActiveObject(activeId);
            setDraggingObject({ card: activeId });
        }
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        const activeId = active.id.toString() as UID;
        const overId = over?.id.toString() as UID;
        if (activeId === overId) {
            return;
        }
        if (listToCardsMap.has(activeId)) {
            // is dragging list
            return;
        }
        if (!overId) {
            return;
        }
        // is dragging card
        if (listToCardsMap.has(overId)) {
            // is over a list - put that card into the list
            const currentListId = cardToListMap.get(activeId);
            if (overId !== currentListId) {
                moveCardToListAndPos(activeId, overId);
            }
            return;
        }

        // is over a card - get the list and put it in
        const currentListId = cardToListMap.get(activeId);
        const newListId = cardToListMap.get(overId);
        if (!newListId) {
            console.error('No listid found', overId);
            return;
        }
        const newListCards = listToCardsMap.get(newListId);
        if (!newListCards) {
            console.error('No list found', overId);
            return;
        }

        let injectPos: number | undefined = undefined;
        if (newListId !== currentListId) {
            const oldPos = newListCards.findIndex((c) => c === overId);
            injectPos = oldPos >= 0 ? oldPos : newListCards.length + 1;
        }

        moveCardToListAndPos(activeId, newListId, injectPos);
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            const activeId = active.id.toString() as UID;
            const overId = over?.id.toString() as UID;
            setDraggingObject({});
            setActiveObject(null);
            if (!over) {
                return;
            }
            // is dropping list
            if (listToCardsMap.has(activeId)) {
                const newIndex = Array.from(listToCardsMap.keys()).findIndex((v) => v === overId);
                if (newIndex > -1) {
                    moveListToPos(activeId, newIndex);
                    emitMoveList(sockCtx, activeId, newIndex);
                }
                return;
            }
            // is dropping card over a list
            if (listToCardsMap.has(overId)) {
                const cardsListId = cardToListMap.get(activeId);
                if (overId !== cardsListId) {
                    moveCardToListAndPos(activeId, overId);
                    emitMoveCard(sockCtx, activeId, overId);
                }
                return;
            }
            // is dropping a card over another card
            const newListId = cardToListMap.get(overId);
            if (!newListId) {
                console.error('No listId found', overId);
                return;
            }
            const newList = listToCardsMap.get(newListId);
            if (!newList) {
                console.error('No list found', overId);
                return;
            }

            const injectPos = newList.findIndex((c) => c === overId);
            const newIndex = injectPos >= 0 ? injectPos : newList.length + 1;
            moveCardToListAndPos(activeId, newListId, newIndex);
            emitMoveCard(sockCtx, activeId, newListId, newIndex);
        },
        [sockCtx.connected]
    );

    const handleDragAbort = useCallback((event: DragAbortEvent) => {
        setActiveObject(null);
        setActiveObject(null);
        setDraggingObject({});
    }, []);

    const handleDragCancel = useCallback((event: DragCancelEvent) => {
        setActiveObject(null);
        setDraggingObject({});
    }, []);

    const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
        // Get the closest list horizontally
        const onlyListArgs = { ...args, droppableContainers: args.droppableContainers.filter((container) => listToCardsMap.has(container.id.toString() as UID)) };
        let intersectingId = horizontalCollisionDetection(onlyListArgs) as UID;

        // If theres no intersection, fall back to the last known intersected item
        if (!intersectingId) {
            //TODO check if this is causing the weird offset issues
            return lastOverId.current ? [{ id: lastOverId.current }] : [];
        }

        // If dragging a list, easy - collide with another list
        if (args.active.data.current?.type === 'list') {
            return [{ id: intersectingId }];
        }

        // If dragging a card, find which list you're closest to
        if (args.active.data.current?.type === 'card') {
            const list = listToCardsMap.get(intersectingId);
            if (list) {
                // If the list is empty, just intersect with the list
                // If the list has cards, find the closest card to intersect with
                if (list.length > 0) {
                    const onlyCardsInThisListArgs = {
                        ...args,
                        droppableContainers: args.droppableContainers.filter(
                            (droppable) =>
                                droppable.id !== intersectingId && // dont intersect with the actual list
                                !!list.find((c) => c === droppable.id) // only intersect with cards in this list
                        ),
                    };
                    intersectingId = closestCenter(onlyCardsInThisListArgs)[0]?.id.toString() as UID;
                }
                lastOverId.current = intersectingId;
                return [{ id: intersectingId }];
            }
            return lastOverId.current ? [{ id: lastOverId.current }] : [];
        }
        return [];
    }, []);

    if ((!boardId && !cardId) || !boardData) {
        return (
            <NotFound
                itemType="board"
                error={PageErrors.NOT_FOUND}
            />
        );
    }

    const onRender: React.ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
        // console.log("Rendered", id, "in", phase, "for", actualDuration+"ms", "from", startTime+"ms", "to", commitTime+"ms");
    };

    return (
        // <Profiler onRender={onRender} id={"board"}>
        <Container
            h={`calc(100vh - ${trz.navbarHeight}px)`}
            fluid
            maw="100%"
            p="lg"
            bg="#1d2022"
            style={{
                overflowX: 'scroll',
            }}
        >
            <CollaborativeMouseTracker
                boardId={boardId}
                draggingObject={draggingObject}
                style={{
                    height: '95%',
                    width: 'auto',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    flexWrap: 'nowrap',
                }}
            >
                <DndContext
                    sensors={sensors}
                    collisionDetection={collisionDetectionStrategy}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragStart={handleDragStart}
                    onDragAbort={handleDragAbort}
                    onDragCancel={handleDragCancel}
                    measuring={{
                        droppable: {
                            strategy: MeasuringStrategy.Always,
                        },
                    }}
                >
                    <BoardContext.Provider
                        value={{
                            listToCardsMap,
                        }}
                    >
                        <SortableContext
                            items={listKeys}
                            strategy={horizontalListSortingStrategy}
                        >
                            {memoizedSortableLists}
                        </SortableContext>
                        {createPortal(<DragOverlay dropAnimation={boardDropAnimation}>{activeObject ? (listToCardsMap.has(activeObject) ? renderListDragOverlay(activeObject, boardData.boardCode ?? '#') : renderCardDragOverlay(activeObject, boardData.boardCode ?? '#')) : null}</DragOverlay>, document.body)}
                    </BoardContext.Provider>
                </DndContext>
                <CreateList
                    onCreateList={async (title) => {
                        try {
                            await createList(sockCtx, boardData.id, title);
                        } catch (e) {
                            notify(NoteType.LIST_CREATION_ERROR, e);
                            return;
                        }
                    }}
                />
                {openedCard && (
                    <CardDetails
                        cardId={openedCard}
                        onClose={closeModal}
                        boardCode={boardData.boardCode}
                    />
                )}
            </CollaborativeMouseTracker>
        </Container>
        // </Profiler>
    );
};

export default BoardPage;

interface RenderSortableListProps {
    listId: ListId;
    boardCode: string;
    onClickCard: (cardId: CardId) => void;
}
const RenderSortableList = (props: RenderSortableListProps) => {
    return (
        <SortableList
            key={props.listId}
            listId={props.listId}
            boardCode={props.boardCode}
            onClickCard={props.onClickCard}
        />
    );
};

const MemoRenderSortableList = React.memo(RenderSortableList, (prev, next) => {
    return prev.boardCode === next.boardCode && prev.listId === next.listId;
});
