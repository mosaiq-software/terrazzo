import {
    ActionIcon,
    Box,
    Button,
    Center,
    Combobox,
    Group,
    Loader,
    Modal,
    Stack,
    Text,
    Tooltip,
    useCombobox,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { CardId, fullName, ListId, TextBlockResourceType } from '@mosaiq/terrazzo-common';
import { BlockNoteEditor } from '@trz/components/BlockNote/BlockNoteEditor';
import EditableTextbox from '@trz/components/UI/EditableTextbox';
import { NotFound, PageErrors } from '@trz/components/UI/NotFound';
import { RectHoldingButton } from '@trz/components/UI/RectHoldingButton';
import { useSocket } from '@trz/contexts/socket-context';
import { useUserContext } from '@trz/contexts/user-context';
import { emitMoveCard, updateCardAssignee, updateCardField } from '@trz/emitters';
import { useCard } from '@trz/hooks/useCard';
import { useCatchSaveKey } from '@trz/hooks/useCatchSaveKey';
import { useUser } from '@trz/hooks/useUser';
import { useBoardMetadata } from '@trz/pages/BoardPage';
import { getCardNumber } from '@trz/util/boardUtils';
import { COLORS } from '@trz/util/colors';
import { niceDateWithTime } from '@trz/util/dateUtils';
import { NoteType, notify } from '@trz/util/notifications';
import React, { useMemo } from 'react';
import { FaArchive, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import { MdFileCopy } from 'react-icons/md';
import { AssigneeMenu } from './AssigneeMenu';
import { LabelsMenu } from './LabelsMenu';
import { PriorityButtons } from './PriorityButtons';

interface CardDetailsProps {
    cardId: CardId;
    boardCode: string;
    onClose: () => void;
}
const CardDetails = (props: CardDetailsProps): React.JSX.Element | null => {
    const sockCtx = useSocket();
    const usr = useUserContext();
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const clipboard = useClipboard({ timeout: 500 });
    const card = useCard(props.cardId, false, true);
    useCatchSaveKey();
    const boardMeta = useBoardMetadata();
    const perms = boardMeta?.permissions;
    
const currentListId = useMemo(() => {
  return boardMeta?.lists.find(list =>
    list.cardIds.includes(props.cardId)
  )?.listId;
}, [boardMeta?.lists, props.cardId]);

   
const listOptions = useMemo(() => {
  return boardMeta?.lists.map(list => ({
    value: list.listId,
    label: list.listId, // or maybe get from a map later
  })) ?? [];
}, [boardMeta?.lists]);



const handleMove = (toListId: ListId) => {
  if (!boardMeta?.permissions.moveCards || toListId === currentListId) return;
  emitMoveCard(sockCtx, props.cardId, toListId, undefined); // to end of list
};

    const cardDetailsComboBox = useCombobox({
        onDropdownClose: () => cardDetailsComboBox.resetSelectedOption(),
    });
    const createdByUser = useUser(card?.createdById ?? undefined);

    const onCloseModal = () => {
        props.onClose();
    };

    alert('test');
    useBoardMetadata(); //force board metadata to load so that permissions are correct when the modal is opened


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
            await emitMoveCard(sockCtx, card.id, card.listId, null);
        } else {
            await emitMoveCard(sockCtx, card.id, card.listId, 0);
        }
        onCloseModal(); //this wont run ever due to sockCtx.boardData being updated
    }

    if (!props.cardId) {
        return null;
    }

    const joinedCard = !!usr.userId && card?.assignees.includes(usr.userId);

    if (!card) {
        return (
            <Center>x
                <Stack align="center">
                    <Loader type="bars" />
                    <Text ta="center">Loading...</Text>
                </Stack>
            </Center>
        );
    }

    if (!perms?.viewBoard) {
        return (
            <NotFound
                itemType="card"
                error={PageErrors.UNAUTHORIZED}
            />
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
                bg={COLORS.background.light}
                c={COLORS.text.primary}
                style={{
                    overflowX: 'hidden',
                    overflowY: 'scroll',
                }}
            >
                <Modal.Header
                    p="0"
                    bg={COLORS.background.medium}
                >
                    <Modal.Title w={'100%'}>
                        <Group justify="space-between">
                            <Stack
                                w="100%"
                                gap="xs"
                            >
                                {card.order === null && (
                                    <Box
                                        bg={COLORS.semantic.warning}
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
                                            bg: COLORS.transparent,
                                        }}
                                        style={{
                                            width: '95%',
                                        }}
                                        readonly={!perms?.editCard}
                                    />
                                    <Tooltip label="Copy card ID">
                                        <Button
                                            variant="subtle"
                                            c={COLORS.text.primary}
                                            onClick={() => {
                                                clipboard.copy(getCardNumber(props.boardCode, card.cardNumber));
                                            }}
                                        >
                                            {clipboard.copied ? (
                                                <MdFileCopy
                                                    color={COLORS.text.primary}
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
                            c={COLORS.text.primary}
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
                        gap={'lg'}
                    >
                        <Group>
                            <Combobox
    store={combobox}
    onOptionSubmit={(val) => {
      handleMove(val as ListId);
      combobox.closeDropdown();
    }}
  >
    <Combobox.Target>
      <Button
        variant="light"
        onClick={() => combobox.toggleDropdown()}
      >
        Move to:{' '}
        {listOptions.find(opt => opt.value === currentListId)?.label}
      </Button>
    </Combobox.Target>

    <Combobox.Dropdown>
      <Combobox.Options>
        {listOptions.map(option => (
          <Combobox.Option
            key={option.value}
            value={option.value}
            active={option.value === currentListId}
          >
            {option.label}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox.Dropdown>
  </Combobox>
                            <PriorityButtons
                                card={card}
                                viewOnly={!perms.editCard}
                            />
                            <LabelsMenu
                                card={card}
                                boardLabels={boardMeta.labels}
                                viewOnly={!perms.editCard}
                            />
                            <AssigneeMenu
                                card={card}
                                viewOnly={!perms.editCard}
                            />
                            {perms.editCard && (
                                <Tooltip label={`${joinedCard ? 'Leave' : 'Join'} Card`}>
                                    <ActionIcon
                                        variant="subtle"
                                        c={COLORS.text.primary}
                                        onClick={() => {
                                            if (usr.userId) {
                                                updateCardAssignee(sockCtx, card.id, usr.userId, !joinedCard);
                                            }
                                        }}
                                    >
                                        {joinedCard ? <FaUserMinus /> : <FaUserPlus />}
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                        <BlockNoteEditor
                            textBlockId={card.descriptionTextBlockId}
                            placeholder="Start writing a description or hit '/' for commands..."
                            viewOnly={!perms.editCard}
                            resourceType={TextBlockResourceType.Card}
                            resourceId={card.id}
                        />
                        <Stack
                            style={{
                                position: 'absolute',
                                bottom: 0,
                            }}
                        >
                            <Text
                                c={COLORS.text.secondary}
                                fz="sm"
                            >
                                Created at {niceDateWithTime(card.createdAt)} by {fullName(createdByUser)}
                            </Text>
                            {perms?.editCard && (
                                <RectHoldingButton
                                    durationMs={500}
                                    tooltip="Archived cards can be restored later"
                                    tooltipDelay={500}
                                    height="40px"
                                    variant="outline"
                                    borderColor={COLORS.semantic.error}
                                    onClick={() => onArchiveCard(card.order !== null)}
                                    leftSection={<FaArchive />}
                                >
                                    {card.order === null ? 'Unarchive' : 'Archive'}
                                </RectHoldingButton>
                            )}
                        </Stack>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};

export default CardDetails;