import { ActionIcon, Avatar, Button, Divider, Flex, Menu, Portal, Stack, Tooltip } from '@mantine/core';
import { Card, CardId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType, useSocket } from '@trz/contexts/socket-context';
import { TRZContextType, useTRZ } from '@trz/contexts/TRZ-context';
import { createCard, createDuplicateCard, updateCardAssignee, updateCardField, updateCardsLabels } from '@trz/emitters/all';
import { useCard } from '@trz/hooks/useCard';
import { colorIsDarkAdvanced } from '@trz/util/colorUtils';
import React from 'react';
import { FaArchive, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { MdAccountBox, MdBarChart, MdCheck, MdDocumentScanner, MdLabel, MdLink } from 'react-icons/md';
import { prioNames, PriorityChip, priorityColors, unicodeMap } from './CardDetails/PriorityButtons';
import { Priority } from '@mosaiq/terrazzo-common/constants';
import { NoteType, notify } from '@trz/util/notifications';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { useClipboard } from '@mantine/hooks';
import { useUser } from '@trz/contexts/user-context';

const OPEN_DELAY = 100;
const CLOSE_DELAY = 100;

interface CardContextMenuProps {
    cardId: CardId;
    onClose: () => void;
}
export const CardContextMenu = (props: CardContextMenuProps) => {
    const trzCtx = useTRZ();
    const sockCtx = useSocket();
    const userCtx = useUser();
    const card = useCard(props.cardId, false, true);
    const clipboard = useClipboard();
    if (!card) {
        console.error('No card in context menu');
        return null;
    }
    console.log('Rendering context menu for card', card.id);
    return (
        <Flex
            direction={'column'}
            gap="0"
            justify="start"
            style={{
                overflow: 'visible',
            }}
        >
            <CtxLabelsMenu
                card={card}
                sockCtx={sockCtx}
                trzCtx={trzCtx}
            />
            <CtxPriorityMenu
                card={card}
                sockCtx={sockCtx}
                trzCtx={trzCtx}
            />
            <CtxAssigneesMenu
                card={card}
                sockCtx={sockCtx}
                trzCtx={trzCtx}
            />
            <Divider />
            {userCtx.userData && (
                <>
                    <CtxMenuButton
                        icon={card.assignees.includes(userCtx.userData.id) ? <FaUserMinus size={16} /> : <FaUserPlus size={16} />}
                        text={card.assignees.includes(userCtx.userData.id) ? 'Leave' : 'Join'}
                        onClick={async () => {
                            if (!card) {
                                notify(NoteType.CARD_UPDATE_ERROR);
                                return;
                            }
                            const isMember = card.assignees.includes(userCtx.userData!.id);
                            updateCardAssignee(sockCtx, card.id, userCtx.userData!.id, !isMember);
                        }}
                    />
                    <Divider />
                </>
            )}
            <CtxMenuButton
                icon={<MdDocumentScanner size={16} />}
                text="Duplicate"
                onClick={async () => {
                    await createDuplicateCard(sockCtx, card.id);
                    props.onClose();
                }}
            />
            <CtxMenuButton
                icon={<MdLink size={16} />}
                text="Copy Link"
                onClick={async () => {
                    const topDomain = window.location.origin;
                    const cardLink = `${topDomain}/card/${card.id}`;
                    clipboard.copy(cardLink);
                }}
            />
            <CtxMenuButton
                icon={<FaArchive size={16} />}
                text="Archive"
                onClick={async () => {
                    if (!card) {
                        notify(NoteType.CARD_UPDATE_ERROR);
                        return;
                    }
                    const archive = !card.archived;
                    if (archive) {
                        await updateCardField(sockCtx, card.id, { archived: archive, order: -1 });
                    } else {
                        await updateCardField(sockCtx, card.id, { archived: archive, order: 0 });
                    }
                    props.onClose();
                }}
            />
        </Flex>
    );
};

interface CtxMenuButtonProps {
    icon: any;
    text: string;
    onClick: () => void;
}
const CtxMenuButton = (props: CtxMenuButtonProps) => {
    return (
        <Button
            w="100%"
            fullWidth
            justify="start"
            variant="subtle"
            c="white"
            leftSection={props.icon}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                props.onClick();
            }}
        >
            {props.text}
        </Button>
    );
};

interface CtxMenuItemProps {
    card: Card;
    sockCtx: SocketContextType;
    trzCtx: TRZContextType;
}

export const CtxLabelsMenu = (props: CtxMenuItemProps) => {
    if (!props.trzCtx.boardData?.labels.length) {
        return null;
    }

    return (
        <Menu
            position="right-start"
            withArrow
            arrowPosition="center"
            closeOnClickOutside={true}
            trigger="hover"
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
            withinPortal={false}
        >
            <Menu.Target>
                <Button
                    w="100%"
                    fullWidth
                    justify="start"
                    variant="subtle"
                    c="white"
                    leftSection={<MdLabel size={16} />}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    Labels
                </Button>
            </Menu.Target>
            <Menu.Dropdown left={'105%'}>
                <Menu.Label>Labels</Menu.Label>
                <Stack gap={1}>
                    {props.trzCtx.boardData?.labels.map((label) => {
                        const textColor = colorIsDarkAdvanced(label.color) ? '#fff' : '#000';
                        return (
                            <Button
                                key={label.id}
                                bg={label.color}
                                ta="left"
                                justify="start"
                                c={textColor}
                                style={{
                                    borderRadius: '4px',
                                }}
                                leftSection={
                                    <MdCheck
                                        style={{
                                            visibility: props.card.labels.includes(label.id) ? 'visible' : 'hidden',
                                        }}
                                    />
                                }
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const labels = props.card.labels;
                                    if (labels.includes(label.id)) {
                                        labels.splice(labels.indexOf(label.id), 1);
                                    } else {
                                        labels.push(label.id);
                                    }
                                    updateCardsLabels(props.sockCtx, props.card.id, labels);
                                }}
                            >
                                {label.name}
                            </Button>
                        );
                    })}
                </Stack>
            </Menu.Dropdown>
        </Menu>
    );
};

export const CtxPriorityMenu = (props: CtxMenuItemProps) => {
    const priority = props.card.priority ?? 0;

    const handleOnChange = async (newPriority: Priority) => {
        if (!props.card.id) {
            return;
        }
        try {
            await updateCardField(props.sockCtx, props.card.id, { priority: newPriority });
        } catch (e) {
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
    };

    if (!props.trzCtx.boardData?.labels.length) {
        return null;
    }

    return (
        <Menu
            position="right-start"
            withArrow
            arrowPosition="center"
            closeOnClickOutside={true}
            trigger="hover"
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
            withinPortal={false}
        >
            <Menu.Target>
                <Button
                    w="100%"
                    fullWidth
                    justify="start"
                    variant="subtle"
                    c="white"
                    leftSection={<MdBarChart size={16} />}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    Priority
                </Button>
            </Menu.Target>
            <Menu.Dropdown left={'105%'}>
                <Flex
                    direction="column-reverse"
                    align="center"
                >
                    {priorityColors.map((_, index) => {
                        return (
                            <Tooltip
                                key={index}
                                label={prioNames[index]}
                                position="right"
                                withArrow
                            >
                                <Menu.Item
                                    key={index}
                                    bg={priorityColors[index]}
                                    ta="center"
                                    c="white"
                                    onClickCapture={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleOnChange(index);
                                    }}
                                >
                                    {priority === index ? `[ ${unicodeMap[index]} ]` : unicodeMap[index]}
                                </Menu.Item>
                            </Tooltip>
                        );
                    })}
                    <Menu.Label>Priority</Menu.Label>
                </Flex>
            </Menu.Dropdown>
        </Menu>
    );
};

export const CtxAssigneesMenu = (props: CtxMenuItemProps) => {
    if (!props.trzCtx.boardData?.labels.length) {
        return null;
    }

    return (
        <Menu
            position="right-start"
            withArrow
            arrowPosition="center"
            closeOnClickOutside={true}
            trigger="hover"
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
            withinPortal={false}
        >
            <Menu.Target>
                <Button
                    w="100%"
                    fullWidth
                    justify="start"
                    variant="subtle"
                    c="white"
                    leftSection={<FaUserPlus size={16} />}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    Assignees
                </Button>
            </Menu.Target>
            <Menu.Dropdown
                ta="center"
                left="105%"
            >
                <Menu.Label>Assignees</Menu.Label>
                <Stack gap={1}>
                    {props.trzCtx.boardData?.members.map((memRec) => {
                        const isMember = props.card.assignees.includes(memRec.user.id);
                        return (
                            <Button
                                key={memRec.user.id}
                                bg={isMember ? 'blue' : 'transparent'}
                                ta="left"
                                justify="start"
                                c={'white'}
                                leftSection={
                                    <Avatar
                                        src={memRec.user.profilePicture}
                                        size={24}
                                    />
                                }
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateCardAssignee(props.sockCtx, props.card.id, memRec.user.id, !isMember);
                                }}
                            >
                                {fullName(memRec.user)}
                            </Button>
                        );
                    })}
                </Stack>
            </Menu.Dropdown>
        </Menu>
    );
};
