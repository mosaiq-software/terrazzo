import { ActionIcon, Group, Menu, Stack, Text } from '@mantine/core';
import { boardNameWithCode, cardNameWithBoardCodeAndNumber, QueryableItem, UID } from '@mosaiq/terrazzo-common';
import { FullLoader } from '@trz/components/UI/LoadingWrapper';
import { UserProfilePopup } from '@trz/components/UI/UserAvatar/UserProfilePopup';
import { useBoard } from '@trz/hooks/useBoard';
import { useCard } from '@trz/hooks/useCard';
import { useDocument } from '@trz/hooks/useDocument';
import { useUser } from '@trz/hooks/useUser';
import { COLORS } from '@trz/util/colors';
import { forAllClickEvents, noEventBubble } from '@trz/util/eventUtils';
import { MdArrowForward } from 'react-icons/md';
import { useNavigate } from 'react-router';

/**
 * type and id can be '' if something went wrong, so we treat them as strings
 */
interface BlockNoteMentionWithPopupProps {
    type: string;
    id: string;
}
interface DelegatedBlockNoteMentionWithPopupProps {
    id: UID;
}
export const BlockNoteMentionWithPopup = (props: BlockNoteMentionWithPopupProps) => {
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

const MentionTag = (props: { title: string }) => {
    {
        return <span style={{ backgroundColor: COLORS.accent.pink.darkMuted }}>@{props.title}</span>;
    }
};

const Mention = (props: { title: string; children: React.ReactNode }) => {
    return (
        <Menu
            width={400}
            position="bottom-end"
            arrowPosition="center"
            arrowSize={10}
            withArrow
            shadow="md"
            trigger="hover"
            closeOnClickOutside
            withinPortal
        >
            <Menu.Target>
                <Text span>
                    <MentionTag title={props.title} />
                </Text>
            </Menu.Target>
            <Menu.Dropdown>
                <MentionPopupBase>{props.children}</MentionPopupBase>
            </Menu.Dropdown>
        </Menu>
    );
};

const UserMentionPopup = (props: DelegatedBlockNoteMentionWithPopupProps) => {
    const user = useUser(props.id);
    const title = user ? `${user.firstName} ${user.lastName}` : 'Loading...';
    return <Mention title={title}>{user ? <UserProfilePopup user={user} /> : <FullLoader />}</Mention>;
};

const BoardMentionPopup = (props: DelegatedBlockNoteMentionWithPopupProps) => {
    const { boardData } = useBoard(props.id);
    const navigate = useNavigate();
    const title = boardData ? boardNameWithCode(boardData.name, boardData.boardCode) : 'Loading...';

    return (
        <Mention title={title}>
            {boardData ? (
                <Group
                    wrap="nowrap"
                    justify="space-between"
                >
                    <Text>{title}</Text>
                    <ActionIcon
                        variant="subtle"
                        onClick={() => navigate(`/board/${boardData.id}`)}
                        size="input-xs"
                    >
                        <MdArrowForward />
                    </ActionIcon>
                </Group>
            ) : (
                <FullLoader />
            )}
        </Mention>
    );
};

const CardMentionPopup = (props: DelegatedBlockNoteMentionWithPopupProps) => {
    const card = useCard(props.id, false, true);
    const { boardData } = useBoard(card?.boardId);
    const navigate = useNavigate();
    const title = card
        ? cardNameWithBoardCodeAndNumber(card.name, boardData?.boardCode, card.cardNumber)
        : 'Loading...';
    return (
        <Mention title={title}>
            {card ? (
                <Group
                    wrap="nowrap"
                    justify="space-between"
                >
                    <Text>{title}</Text>
                    <ActionIcon
                        variant="subtle"
                        onClick={() => navigate(`/card/${card.id}`)}
                        size="input-xs"
                    >
                        <MdArrowForward />
                    </ActionIcon>
                </Group>
            ) : (
                <FullLoader />
            )}
        </Mention>
    );
};

const DocumentMentionPopup = (props: DelegatedBlockNoteMentionWithPopupProps) => {
    const { document } = useDocument(props.id);
    const navigate = useNavigate();
    const title = document ? document.name : 'Loading...';

    return (
        <Mention title={title}>
            {document ? (
                <Group
                    wrap="nowrap"
                    justify="space-between"
                >
                    <Text>{document.name}</Text>
                    <ActionIcon
                        variant="subtle"
                        onClick={() => navigate(`/doc/${document.id}`)}
                        size="input-xs"
                    >
                        <MdArrowForward />
                    </ActionIcon>
                </Group>
            ) : (
                <FullLoader />
            )}
        </Mention>
    );
};

const MentionPopups: Record<QueryableItem, React.FC<DelegatedBlockNoteMentionWithPopupProps>> = {
    [QueryableItem.User]: UserMentionPopup,
    [QueryableItem.Board]: BoardMentionPopup,
    [QueryableItem.Card]: CardMentionPopup,
    [QueryableItem.Document]: DocumentMentionPopup,
};
