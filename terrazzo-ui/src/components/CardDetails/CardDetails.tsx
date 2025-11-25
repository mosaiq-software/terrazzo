import { ActionIcon, Box, Button, Center, Group, Loader, Modal, Stack, Text, Tooltip, useCombobox } from '@mantine/core';
import { useClipboard, useIdle } from '@mantine/hooks';
import { CardId } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { PriorityButtons } from '@trz/components/CardDetails/PriorityButtons';
import { CollaborativeTextArea } from '@trz/components/CollaborativeTextArea/CollaborativeTextArea';
import EditableTextbox from '@trz/components/EditableTextbox';
import { useSocket } from '@trz/contexts/socket-context';
import { useUser } from '@trz/contexts/user-context';
import { updateCardAssignee, updateCardField } from '@trz/emitters';
import { useCard } from '@trz/hooks/useCard';
import { useCatchSaveKey } from '@trz/hooks/useCatchSaveKey';
import { useBoardMetadata } from '@trz/pages/BoardPage';
import { getCardNumber } from '@trz/util/boardUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { IDLE_TIMEOUT_MS } from '@trz/util/textUtils';
import React from 'react';
import { FaArchive, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import { MdFileCopy } from 'react-icons/md';
import { AssigneeMenu } from './AssigneeMenu';
import { LabelsMenu } from './LabelsMenu';

interface CardDetailsProps {
    cardId: CardId;
    boardCode: string;
    onClose: () => void;
}
const CardDetails = (props: CardDetailsProps): React.JSX.Element | null => {
    const sockCtx = useSocket();
    const usr = useUser();
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const idle = useIdle(IDLE_TIMEOUT_MS);
    const clipboard = useClipboard({ timeout: 500 });
    const card = useCard(props.cardId, false, true);
    useCatchSaveKey();
    const boardMeta = useBoardMetadata();

    const onCloseModal = () => {
        props.onClose();
    };

    async function onTitleChange(value: string) {
        if (!card) {
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
        try {
            updateCardField(sockCtx, card.id, { name: value });
        } catch (e) {
            notify(NoteType.CARD_UPDATE_ERROR, e);
            return;
        }
    }

    async function onArchiveCard(archive: boolean) {
        if (!card) {
            notify(NoteType.CARD_UPDATE_ERROR);
            return;
        }
        if (archive) {
            await updateCardField(sockCtx, card.id, { archived: archive, order: -1 });
        } else {
            await updateCardField(sockCtx, card.id, { archived: archive, order: 0 });
        }
        onCloseModal(); //this wont run ever due to sockCtx.boardData being updated
    }

    if (!props.cardId) {
        return null;
    }

    const joinedCard = !!usr.userData && card?.assignees.includes(usr.userData.id);

    if (!card) {
        return (
            <Center>
                <Stack align="center">
                    <Loader type="bars" />
                    <Text ta="center">Loading...</Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Modal.Root
            opened
            closeOnClickOutside
            onClose={onCloseModal}
            centered
            size={'800px'}
        >
            <Modal.Overlay
                backgroundOpacity={0.5}
                blur={3}
            />
            <Modal.Content
                h={'90vh'}
                bg={'#1d2022'}
                c={'white'}
                style={{
                    overflowX: 'hidden',
                    overflowY: 'scroll',
                }}
            >
                <Modal.Header
                    p="0"
                    bg={'#1d2022'}
                >
                    <Modal.Title w={'100%'}>
                        <Group justify="space-between">
                            <Stack
                                w="100%"
                                gap="xs"
                            >
                                {card.archived && (
                                    <Box
                                        bg="yellow"
                                        p="sm"
                                    >
                                        <Group justify="space-between">
                                            <Text fz="xl">This card is archived.</Text>
                                        </Group>
                                    </Box>
                                )}
                                <Stack
                                    gap="xs"
                                    align="flex-start"
                                    justify="flex-start"
                                    pt="lg"
                                    pl="lg"
                                    pr="lg"
                                >
                                    <EditableTextbox
                                        value={card.name}
                                        onChange={onTitleChange}
                                        type="title"
                                        placeholder="Card name.."
                                        titleProps={{
                                            order: 3,
                                            textWrap: 'nowrap',
                                            fw: 400,
                                        }}
                                        inputProps={{
                                            w: '100%',
                                            bg: 'transparent',
                                        }}
                                        style={{
                                            width: '95%',
                                        }}
                                    />
                                    <Tooltip label="Copy card ID">
                                        <Button
                                            variant="subtle"
                                            c="white"
                                            onClick={() => {
                                                clipboard.copy(getCardNumber(props.boardCode, card.cardNumber));
                                            }}
                                        >
                                            {clipboard.copied ? (
                                                <MdFileCopy
                                                    color="white"
                                                    size="1rem"
                                                />
                                            ) : (
                                                <Text fz="sm">{getCardNumber(props.boardCode, card.cardNumber)}</Text>
                                            )}
                                        </Button>
                                    </Tooltip>
                                </Stack>
                            </Stack>
                        </Group>
                        <Modal.CloseButton
                            variant="transparent"
                            c={'white'}
                            style={{
                                position: 'absolute',
                                top: '0.75rem',
                                right: '0.75rem',
                                backdropFilter: 'blur(5px)',
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body p={20}>
                    <Stack
                        style={{
                            position: 'relative',
                        }}
                        pb="8rem"
                    >
                        <Group>
                            <PriorityButtons card={card} />
                            <LabelsMenu
                                card={card}
                                boardLabels={boardMeta.labels}
                            />
                            <AssigneeMenu
                                card={card}
                                boardMembers={boardMeta.members}
                            />
                            <Tooltip label={`${joinedCard ? 'Leave' : 'Join'} Card`}>
                                <ActionIcon
                                    variant="subtle"
                                    c="white"
                                    onClick={() => {
                                        if (usr.userData) {
                                            updateCardAssignee(sockCtx, card.id, usr.userData.id, !joinedCard);
                                        }
                                    }}
                                >
                                    {joinedCard ? <FaUserMinus /> : <FaUserPlus />}
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                        <CollaborativeTextArea
                            textBlockId={card.descriptionTextBlockId}
                            maxLineLength={60}
                            placeholder="Add a more detailed description..."
                            idle={idle}
                            name={fullName(usr.userData)}
                            avatarUrl={usr.userData?.profilePicture}
                        />
                        <Stack
                            style={{
                                position: 'absolute',
                                bottom: 0,
                            }}
                        >
                            <Text>
                                Created at {new Date(card.createdAt).toLocaleString()} by {fullName(card.createdBy)}
                            </Text>
                            <Tooltip label="Archived cards can be restored later">
                                <Button
                                    variant="subtle"
                                    c="white"
                                    key={card.archived ? 'Unarchive' : 'Archive'}
                                    leftSection={<FaArchive />}
                                    justify={'flex-start'}
                                    onClick={() => onArchiveCard(!card.archived)}
                                >
                                    {card.archived ? 'Unarchive' : 'Archive'}
                                </Button>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};

export default CardDetails;
