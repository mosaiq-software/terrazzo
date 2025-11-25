import { Avatar, Divider } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { Priority } from '@mosaiq/terrazzo-common/constants';
import { CardId } from '@mosaiq/terrazzo-common/types';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { useUser } from '@trz/contexts/user-context';
import { createDuplicateCard, updateCardAssignee, updateCardField, updateCardsLabels } from '@trz/emitters';
import { useCard } from '@trz/hooks/useCard';
import { NoteType, notify } from '@trz/util/notifications';
import { FaArchive, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import { MdBarChart, MdCheckBox, MdDocumentScanner, MdLabel, MdLink, MdOutlineCheckBoxOutlineBlank, MdOutlineRadioButtonUnchecked, MdRadioButtonChecked } from 'react-icons/md';
import { ContextMenuButton } from '../ContextMenu/ContextMenuButton';
import { ContextMenuLayout } from '../ContextMenu/ContextMenuLayout';
import { ContextMenuSelectorMenu } from '../ContextMenu/ContextMenuSelectorMenu';
import { priorityColors, unicodeMap } from './PriorityButtons';

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

    return (
        <ContextMenuLayout>
            {!!trzCtx.boardData?.labels.length && (
                <ContextMenuSelectorMenu
                    title={`Labels${card.labels.length > 0 ? ` (${card.labels.length})` : ''}`}
                    icon={<MdLabel size={16} />}
                    items={trzCtx.boardData.labels.map((label) => ({
                        id: label.id,
                        label: label.name,
                        color: label.color,
                        leftIcon: card.labels.includes(label.id) ? <MdCheckBox size={16} /> : <MdOutlineCheckBoxOutlineBlank size={16} />,
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
                textColor="#fff"
                textAlign="left"
                items={priorityColors.map((color, index) => ({
                    id: index.toString(),
                    label: unicodeMap[index],
                    color: color,
                    leftIcon: (card.priority ?? 0) === index ? <MdRadioButtonChecked size={16} /> : <MdOutlineRadioButtonUnchecked size={16} />,
                }))}
                onSelect={async (selected) => {
                    await updateCardField(sockCtx, card.id, { priority: Number(selected) as Priority });
                }}
            />
            <ContextMenuSelectorMenu
                title={`Assignees${card.assignees.length > 0 ? ` (${card.assignees.length})` : ''}`}
                icon={<FaUserPlus size={16} />}
                items={
                    trzCtx.boardData?.members.map((memRec) => ({
                        id: memRec.user.id,
                        label: fullName(memRec.user),
                        rightIcon: card.assignees.includes(memRec.user.id) ? <MdCheckBox size={16} /> : <MdOutlineCheckBoxOutlineBlank size={16} />,
                        leftIcon: (
                            <Avatar
                                src={memRec.user.profilePicture}
                                size={20}
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
            {userCtx.userData && (
                <>
                    <ContextMenuButton
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
                    const topDomain = window.location.origin;
                    const cardLink = `${topDomain}/card/${card.id}`;
                    clipboard.copy(cardLink);
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
                    const archive = !card.archived;
                    if (archive) {
                        await updateCardField(sockCtx, card.id, { archived: archive, order: -1 });
                    } else {
                        await updateCardField(sockCtx, card.id, { archived: archive, order: 0 });
                    }
                    props.onClose();
                }}
            />
        </ContextMenuLayout>
    );
};
