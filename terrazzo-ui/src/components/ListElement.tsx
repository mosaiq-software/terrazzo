import React, { useContext, useEffect, useState } from 'react';
import EditableTextbox from '@trz/components/EditableTextbox';
import { Button, Group, Paper, Stack, CloseButton, TextInput, Flex, FocusTrap, Menu, Text } from '@mantine/core';
import { useClickOutside, getHotkeyHandler } from '@mantine/hooks';
import { CardId, ListHeader, ListId } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { NoteType, notify } from '@trz/util/notifications';
import { captureDraggableEvents, captureEvent, forAllClickEvents } from '@trz/util/eventUtils';
import { FaArchive } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import { createCard, getListData, updateListField } from '@trz/emitters';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableCard from './DragAndDrop/SortableCard';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { BoardContext } from '@trz/pages/BoardPage';
import { LIST_CACHE_PREFIX } from '@trz/util/boardUtils';

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
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState('');
    const [cardTitle, setCardTitle] = useState('');
    const clickOutsideRef = useClickOutside(() => onBlur());
    const sockCtx = useSocket();

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

    useSocketListener<ServerSE.UPDATE_LIST_FIELD>(ServerSE.UPDATE_LIST_FIELD, (payload) => {
        if (props.listId !== payload.id) {
            return;
        }
        setList((prev) => {
            if (!prev) {
                return prev;
            }
            const updated = updateBaseFromPartial<ListHeader>(prev, payload);
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

        setVisible(usingHotkey);
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
        setVisible((v) => !v);
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
            {process.env.DEBUG === 'true' && <Text fz="6pt">{props.listId}</Text>}
            <Group
                {...props.handleProps}
                justify="space-between"
                align="center"
                wrap="nowrap"
                py="xs"
                px="sm"
                w="100%"
                style={{
                    cursor: 'pointer',
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
                />

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
                            {...captureDraggableEvents(
                                captureEvent,
                                forAllClickEvents((e) => {
                                    captureEvent(e);
                                })
                            )}
                            variant="subtle"
                            c="#ffffff"
                            h="100%"
                            px={5}
                        >
                            <HiDotsVertical />
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown
                        {...captureDraggableEvents(
                            captureEvent,
                            forAllClickEvents((e) => {
                                captureEvent(e);
                            })
                        )}
                    >
                        <Menu.Label>Settings</Menu.Label>
                        <Menu.Item
                            onClick={onArchive}
                            leftSection={<FaArchive />}
                        >
                            Archive List
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
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
                <ListCardStack {...props} />
            </Stack>

            <Group>
                {visible && (
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

            {!visible && (
                <Button
                    w="100%"
                    variant="light"
                    color="gray"
                    onClickCapture={(e) => {
                        setVisible((v) => !v);
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

const ListCardStack = (props: ListElementProps) => {
    const boardContext = useContext(BoardContext);
    const cardIds = boardContext?.listToCardsMap.get(props.listId) ?? [];
    return (
        <SortableContext
            items={cardIds}
            strategy={verticalListSortingStrategy}
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
