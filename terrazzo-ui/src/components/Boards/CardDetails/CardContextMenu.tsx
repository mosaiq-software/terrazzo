import { Avatar, Divider } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { CardId, fullName, Label, Priority } from '@mosaiq/terrazzo-common';
import { ContextMenuButton } from '@trz/components/ContextMenu/ContextMenuButton';
import { ContextMenuLayout } from '@trz/components/ContextMenu/ContextMenuLayout';
import { ContextMenuSelectorMenu } from '@trz/components/ContextMenu/ContextMenuSelectorMenu';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { useUserContext } from '@trz/contexts/user-context';
import {
    createDuplicateCard,
    emitMoveCard,
    updateCardAssignee,
    updateCardField,
    updateCardsLabels,
} from '@trz/emitters';
import { useCard } from '@trz/hooks/useCard';
import { COLORS } from '@trz/util/colors';
import { getCardLink } from '@trz/util/linkUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { FaArchive, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import {
    MdBarChart,
    MdCheckBox,
    MdDocumentScanner,
    MdLabel,
    MdLink,
    MdOutlineCheckBoxOutlineBlank,
    MdOutlineRadioButtonUnchecked,
    MdRadioButtonChecked,
} from 'react-icons/md';
import { priorityColors, PriorityIcons } from './PriorityButtons';

interface CardContextMenuProps {
    cardId: CardId;
    onClose: () => void;
    boardLabels: Label[];
}
export const CardContextMenu = (props: CardContextMenuProps) => {
    const sockCtx = useSocket();
    const userCtx = useUserContext();
    const orgCtx = useOrg();
    const card = useCard(props.cardId, false, true);
    const clipboard = useClipboard();

    if (!card) {
        return null;
    }

    return (
        <ContextMenuLayout>
            {!!props.boardLabels.length && (
                <ContextMenuSelectorMenu
                    title={`Labels${card.labels.length > 0 ? ` (${card.labels.length})` : ''}`}
                    icon={<MdLabel size={16} />}
                    items={props.boardLabels.map((label) => ({
                        id: label.id,
                        label: label.name,
                        color: label.color,
                        leftIcon: card.labels.includes(label.id) ? (
                            <MdCheckBox size={16} />
                        ) : (
                            <MdOutlineCheckBoxOutlineBlank size={16} />
                        ),
                    }))}
                    onSelect={async (selected) => {
                        const labels = card.labels;
                        if (labels.includes(selected)) {
                            labels.splice(labels.indexOf(selected), 1);
                        } else {
                            labels.push(selected);
                        }
                        updateCardsLabels(sockCtx, card.id, labels);
                    }}
                />
            )}
            <ContextMenuSelectorMenu
                title="Priority"
                icon={<MdBarChart size={16} />}
                textColor={COLORS.text.primary}
                textAlign="left"
                items={priorityColors
                    .map((color, index) => ({
                        id: index.toString(),
                        label: PriorityIcons[index]({ size: 16 }),
                        color: color,
                        leftIcon:
                            (card.priority ?? 0) === index ? (
                                <MdRadioButtonChecked size={16} />
                            ) : (
                                <MdOutlineRadioButtonUnchecked size={16} />
                            ),
                    }))
                    .reverse()}
                onSelect={async (selected) => {
                    await updateCardField(sockCtx, card.id, { priority: Number(selected) as Priority });
                }}
            />
            <ContextMenuSelectorMenu
                title={`Assignees${card.assignees.length > 0 ? ` (${card.assignees.length})` : ''}`}
                icon={<FaUserPlus size={16} />}
                items={
                    orgCtx.members.map((memRec) => ({
                        id: memRec.user.id,
                        label: fullName(memRec.user),
                        rightIcon: card.assignees.includes(memRec.user.id) ? (
                            <MdCheckBox size={16} />
                        ) : (
                            <MdOutlineCheckBoxOutlineBlank size={16} />
                        ),
                        leftIcon: (
                            <Avatar
                                src={memRec.user.profilePicture}
                                size={20}
                                name={fullName(memRec.user)}
                                color="initials"
                            />
                        ),
                    })) || []
                }
                onSelect={async (selected) => {
                    const isMember = card.assignees.includes(selected);
                    updateCardAssignee(sockCtx, card.id, selected, !isMember);
                }}
            />
            <Divider />
            {userCtx.userId && (
                <>
                    <ContextMenuButton
                        icon={
                            card.assignees.includes(userCtx.userId) ? (
                                <FaUserMinus size={16} />
                            ) : (
                                <FaUserPlus size={16} />
                            )
                        }
                        text={card.assignees.includes(userCtx.userId) ? 'Leave' : 'Join'}
                        onClick={async () => {
                            if (!card || !userCtx.userId) {
                                notify(NoteType.CARD_UPDATE_ERROR);
                                return;
                            }
                            const isMember = card.assignees.includes(userCtx.userId);
                            updateCardAssignee(sockCtx, card.id, userCtx.userId, !isMember);
                        }}
                    />
                    <Divider />
                </>
            )}
            <ContextMenuButton
                icon={<MdDocumentScanner size={16} />}
                text="Duplicate"
                onClick={async () => {
                    await createDuplicateCard(sockCtx, card.id);
                    props.onClose();
                }}
            />
            <ContextMenuButton
                icon={<MdLink size={16} />}
                text="Copy Link"
                onClick={async () => {
                    clipboard.copy(getCardLink(card.id));
                }}
            />
            <ContextMenuButton
                icon={<FaArchive size={16} />}
                text="Archive"
                onClick={async () => {
                    if (!card) {
                        notify(NoteType.CARD_UPDATE_ERROR);
                        return;
                    }
                    const archive = card.order !== null;
                    if (archive) {
                        await emitMoveCard(sockCtx, card.id, card.listId, null);
                    } else {
                        await emitMoveCard(sockCtx, card.id, card.listId, 0);
                    }
                    props.onClose();
                }}
            />
        </ContextMenuLayout>
    );
};
