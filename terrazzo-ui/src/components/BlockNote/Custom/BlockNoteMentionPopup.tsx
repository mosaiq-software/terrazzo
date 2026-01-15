import { ActionIcon, Group, Stack, Text } from '@mantine/core';
import { boardNameWithCode, cardNameWithBoardCodeAndNumber, QueryableItem, UID } from '@mosaiq/terrazzo-common';
import { FullLoader } from '@trz/components/UI/LoadingWrapper';
import { UserProfilePopup } from '@trz/components/UI/UserAvatar/UserProfilePopup';
import { useBoard } from '@trz/hooks/useBoard';
import { useCard } from '@trz/hooks/useCard';
import { useDocument } from '@trz/hooks/useDocument';
import { useUser } from '@trz/hooks/useUser';
import { forAllClickEvents, noEventBubble } from '@trz/util/eventUtils';
import { useNavigate } from 'react-router';

/**
 * type and id can be '' if something went wrong, so we treat them as strings
 */
interface BlockNoteMentionPopupProps {
    type: string;
    id: string;
}
interface DelegatedBlockNoteMentionPopupProps {
    id: UID;
}
export const BlockNoteMentionPopup = (props: BlockNoteMentionPopupProps) => {
    const type = (props.type || undefined) as QueryableItem | undefined;
    const id = (props.id || undefined) as UID | undefined;

    if (!type || !id) {
        return null;
    }
    const DelegatedPopup = MentionPopups[type];
    return <DelegatedPopup id={id} />;
};

const MentionPopupBase = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
    return (
        <Stack
            p={'sm'}
            {...forAllClickEvents(noEventBubble)}
        >
            {children}
        </Stack>
    );
};

const UserMentionPopup = (props: DelegatedBlockNoteMentionPopupProps) => {
    const user = useUser(props.id);
    return <MentionPopupBase>{user ? <UserProfilePopup user={user} /> : <FullLoader />}</MentionPopupBase>;
};

const BoardMentionPopup = (props: DelegatedBlockNoteMentionPopupProps) => {
    const { boardData } = useBoard(props.id);
    const navigate = useNavigate();
    return (
        <MentionPopupBase>
            {boardData ? (
                <Group
                    wrap="nowrap"
                    justify="space-between"
                >
                    <Text>{boardNameWithCode(boardData.name, boardData.boardCode)}</Text>
                    <ActionIcon
                        variant="subtle"
                        onClick={() => navigate(`/board/${boardData.id}`)}
                        size="input-xs"
                    >
                        ➔
                    </ActionIcon>
                </Group>
            ) : (
                <FullLoader />
            )}
        </MentionPopupBase>
    );
};

const CardMentionPopup = (props: DelegatedBlockNoteMentionPopupProps) => {
    const card = useCard(props.id, false, true);
    const { boardData } = useBoard(card?.boardId);
    const navigate = useNavigate();

    return (
        <MentionPopupBase>
            {card ? (
                <Group
                    wrap="nowrap"
                    justify="space-between"
                >
                    <Text>{cardNameWithBoardCodeAndNumber(card.name, boardData?.boardCode, card.cardNumber)}</Text>
                    <ActionIcon
                        variant="subtle"
                        onClick={() => navigate(`/card/${card.id}`)}
                        size="input-xs"
                    >
                        ➔
                    </ActionIcon>
                </Group>
            ) : (
                <FullLoader />
            )}
        </MentionPopupBase>
    );
};

const DocumentMentionPopup = (props: DelegatedBlockNoteMentionPopupProps) => {
    const { document } = useDocument(props.id);
    const navigate = useNavigate();

    return (
        <MentionPopupBase>
            {document ? (
                <Group
                    wrap="nowrap"
                    justify="space-between"
                >
                    <Text>{document.name}</Text>
                    <ActionIcon
                        variant="subtle"
                        onClick={() => navigate(`/document/${document.id}`)}
                        size="input-xs"
                    >
                        ➔
                    </ActionIcon>
                </Group>
            ) : (
                <FullLoader />
            )}
        </MentionPopupBase>
    );
};

const MentionPopups: Record<QueryableItem, React.FC<DelegatedBlockNoteMentionPopupProps>> = {
    [QueryableItem.User]: UserMentionPopup,
    [QueryableItem.Board]: BoardMentionPopup,
    [QueryableItem.Card]: CardMentionPopup,
    [QueryableItem.Document]: DocumentMentionPopup,
};
