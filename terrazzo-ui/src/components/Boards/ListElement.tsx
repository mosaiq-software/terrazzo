import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, CloseButton, Flex, FocusTrap, Group, Menu, Paper, Stack, Text, TextInput } from '@mantine/core';
import { getHotkeyHandler, useClickOutside } from '@mantine/hooks';
import { CardId, ListHeader, ListId, ServerSE, updateBaseFromPartial } from '@mosaiq/terrazzo-common';
import EditableTextbox from '@trz/components/UI/EditableTextbox';
import { useSocket } from '@trz/contexts/socket-context';
import { createCard, getListData, updateListField } from '@trz/emitters';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { BoardContext, useBoardMetadata } from '@trz/pages/BoardPage';
import { LIST_CACHE_PREFIX } from '@trz/util/boardUtils';
import { captureDraggableEvents, completelyCaptureEvent } from '@trz/util/eventUtils';
import { NoteType, notify } from '@trz/util/notifications';
import React, { useContext, useEffect, useState } from 'react';
import { FaArchive } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import SortableCard from '../DragAndDrop/SortableCard';

interface ListElementProps {
    listId: ListId;
    dragging: boolean;
    droppableSetNodeRef?: (element: HTMLElement | null) => void;
    handleProps?: any;
    isOverlay: boolean;
    boardCode: string;
    onClickCard: (card: CardId) => void;
}
function ListElement(props: ListElementProps): React.JSX.Element {
    const [list, setList] = useState<ListHeader | undefined>(undefined);
    const [listTitle, setListTitle] = useState('');
    const [cardNameInputVisible, setCardNameInputVisible] = useState(false);
    const [error, setError] = useState('');
    const [cardTitle, setCardTitle] = useState('');
    const clickOutsideRef = useClickOutside(() => onBlur());
    const sockCtx = useSocket();
    const boardMeta = useBoardMetadata();

    useEffect(() => {
        const fetchListData = async () => {
            if (!props.listId || !sockCtx.connected) {
                return;
            }
            try {
                const cachedListRes = sessionStorage.getItem(`${LIST_CACHE_PREFIX}${props.listId}`);
                if ((props.dragging || props.isOverlay) && cachedListRes) {
                    const listRes = JSON.parse(cachedListRes);
                    setList(listRes);
                    setListTitle(listRes?.name || '');
                } else {
                    const listRes = await getListData(sockCtx, props.listId);
                    setList(listRes);
                    setListTitle(listRes?.name || '');
                    if (listRes) {
                        sessionStorage.setItem(`${LIST_CACHE_PREFIX}${props.listId}`, JSON.stringify(listRes));
                    } else {
                        sessionStorage.removeItem(`${LIST_CACHE_PREFIX}${props.listId}`);
                    }
                }
            } catch (err) {
                notify(NoteType.LIST_DATA_ERROR, err);
                return;
            }
        };
        fetchListData();
    }, [props.listId, sockCtx.connected]);

    useSocketListener(ServerSE.UPDATE_LIST_FIELD, (payload) => {
        if (props.listId !== payload.id) {
            return;
        }
        setList((prev) => {
            if (!prev) {
                return prev;
            }
            const updated = updateBaseFromPartial(prev, payload);
            if (payload.name) {
                setListTitle(payload.name);
            }
            return updated;
        });
    });

    async function onSubmit(usingHotkey: boolean) {
        setError('');
        setCardTitle('');

        if (cardTitle.length < 1) {
            setError('Enter a Title');
            return;
        }

        if (cardTitle.length > 50) {
            setError('Max 50 characters');
            return;
        }

        try {
            await createCard(sockCtx, props.listId, cardTitle);
        } catch (e) {
            notify(NoteType.CARD_CREATION_ERROR, e);
            return;
        }

        setCardNameInputVisible(usingHotkey);
    }

    async function onTitleChange(value: string) {
        setListTitle(value);
        try {
            await updateListField(sockCtx, props.listId, { name: value });
        } catch (e: any) {
            notify(NoteType.LIST_UPDATE_ERROR, e);
            return;
        }
    }

    async function onArchive() {
        await updateListField(sockCtx, props.listId, { archived: true, order: -1 });
    }

    function onBlur() {
        setCardTitle('');
        setError('');
        setCardNameInputVisible((v) => !v);
    }

    return (
        <Paper
            bg="#121314"
            radius="md"
            shadow="lg"
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                minWidth: '250px',
                maxWidth: '250px',
                minHeight: '5rem',
                maxHeight: '88vh',
                transition: `transform .1s, box-shadow .1s, filter 0ms linear ${props.dragging ? '0ms' : '225ms'}`,
                ...(props.dragging
                    ? props.isOverlay
                        ? {
                              transform: 'rotateZ(3deg) scale(1.02)',
                              boxShadow: '10px 8px 25px black',
                              border: '1px solid #14222e',
                              zIndex: 11,
                          }
                        : {
                              filter: 'grayscale(1) contrast(0) brightness(0) blur(6px)',
                              opacity: 0.4,
                              zIndex: 10,
                          }
                    : undefined),
            }}
            onContextMenuCapture={(e) => {
                e.preventDefault();
            }}
        >
            {import.meta.env.DEBUG === 'true' && <Text fz="6pt">{props.listId}</Text>}
            <Group
                {...props.handleProps}
                justify="space-between"
                align="center"
                wrap="nowrap"
                py="xs"
                px="sm"
                w="100%"
                style={{
                    cursor: boardMeta?.viewOnly ? 'default' : 'pointer',
                    height: '3rem',
                }}
            >
                <EditableTextbox
                    value={listTitle}
                    onChange={onTitleChange}
                    placeholder="Click to edit!"
                    type="title"
                    titleProps={{ order: 6, c: '#ffffff' }}
                    style={{
                        width: '90%',
                    }}
                    viewOnly={!!boardMeta?.viewOnly}
                />

                {!boardMeta?.viewOnly && (
                    <Menu
                        shadow="md"
                        width={200}
                        position="right-start"
                        withArrow
                        arrowPosition="center"
                        withOverlay={true}
                        closeOnClickOutside={true}
                    >
                        <Menu.Target>
                            <Button
                                {...captureDraggableEvents(completelyCaptureEvent)}
                                variant="subtle"
                                c="#ffffff"
                                h="100%"
                                px={5}
                            >
                                <HiDotsVertical />
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown {...captureDraggableEvents(completelyCaptureEvent)}>
                            <Menu.Label>Settings</Menu.Label>
                            <Menu.Item
                                onClick={onArchive}
                                leftSection={<FaArchive />}
                            >
                                Archive List
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}
            </Group>
            <Stack
                ref={props.droppableSetNodeRef}
                mb="md"
                gap={5}
                flex={1}
                style={{
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
            >
                <ListCardStack
                    {...props}
                    viewOnly={!!boardMeta?.viewOnly}
                />
            </Stack>

            <Group>
                {cardNameInputVisible && (
                    <Paper
                        bg={'#121314'}
                        w="250"
                        radius="md"
                        shadow="lg"
                        ref={clickOutsideRef}
                        onKeyDown={getHotkeyHandler([['Enter', () => onSubmit(true)]])}
                    >
                        <FocusTrap>
                            <TextInput
                                placeholder="Enter card title..."
                                value={cardTitle}
                                onChange={(event) => setCardTitle(event.currentTarget.value)}
                                error={error}
                                p="5"
                            />
                        </FocusTrap>
                        <Flex
                            p="5"
                            pt="1"
                        >
                            <Button
                                w="150"
                                mr="auto"
                                variant="light"
                                onClick={() => onSubmit(false)}
                            >
                                {'Create Card'}
                            </Button>
                            <CloseButton
                                onClick={onBlur}
                                size="lg"
                            />
                        </Flex>
                    </Paper>
                )}
            </Group>

            {!cardNameInputVisible && !boardMeta.viewOnly && (
                <Button
                    w="100%"
                    variant="light"
                    color="gray"
                    onClickCapture={(e) => {
                        setCardNameInputVisible((v) => !v);
                    }}
                    style={{
                        maxHeight: '2.5rem',
                        minHeight: '2.25rem',
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                    }}
                    radius="md"
                >
                    Add Card +
                </Button>
            )}
        </Paper>
    );
}

export default ListElement;

interface ListCardStackProps extends ListElementProps {
    viewOnly: boolean;
}
const ListCardStack = (props: ListCardStackProps) => {
    const boardContext = useContext(BoardContext);
    const cardIds = boardContext?.listToCardsMap.get(props.listId) ?? [];
    return (
        <SortableContext
            items={cardIds}
            strategy={verticalListSortingStrategy}
            disabled={props.viewOnly}
        >
            {cardIds.map((cardId) => {
                return (
                    <SortableCard
                        key={cardId}
                        cardId={cardId}
                        listDragging={props.isOverlay || props.dragging}
                        boardCode={props.boardCode ?? '#'}
                        onClick={() => props.onClickCard(cardId)}
                    />
                );
            })}
        </SortableContext>
    );
};
