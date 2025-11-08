import { Box, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Project } from '@mosaiq/terrazzo-common/types';
import { BOARD_CARD_WIDTH, BoardListCard } from '@trz/components/BoardListCards';
import { useSocket } from '@trz/contexts/socket-context';
import { createDocument } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';

interface ProjectTabCardsProps {
    projectData: Project;
}
export const ProjectTabCards = (props: ProjectTabCardsProps) => {
    const projectData = props.projectData;
    const navigate = useNavigate();
    const sockCtx = useSocket();

    const nonArchivedBoards = useMemo(() => {
        return projectData?.boards.filter((board) => !board.archived) ?? [];
    }, [projectData?.boards]);

    const nonArchivedDocs = useMemo(() => {
        return projectData?.documents.filter((doc) => !doc.archived) ?? [];
    }, [projectData?.documents]);

    const onCreateBoard = () => {
        modals.openContextModal({
            modal: 'board',
            title: 'Create Board',
            innerProps: { projectId: projectData.id },
        });
    };

    const onClickBoard = (boardId) => {
        navigate(`/board/${boardId}`);
    };

    const onCreateDocument = async () => {
        const doc = await createDocument(sockCtx, 'New Document', props.projectData.id);
        if (!doc) {
            notify(NoteType.DOC_CREATION_ERROR);
            return;
        }
        onClickDoc(doc.id);
    };

    const onClickDoc = (docId: string) => {
        navigate(`/doc/${docId}`);
    };

    return (
        <Box
            style={{
                width: '80%',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            }}
        >
            <Title
                c="white"
                pb="20"
                order={4}
                maw="200"
            >
                Boards
            </Title>
            <Box
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Box
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(auto-fill, ${BOARD_CARD_WIDTH + 10}px)`,
                        maxWidth: '100%',
                    }}
                >
                    {nonArchivedBoards.map((board) => (
                        <BoardListCard
                            key={board.id}
                            bgColor={'#121314'}
                            color="white"
                            title={board.name}
                            onClick={() => onClickBoard(board.id)}
                        />
                    ))}
                    <BoardListCard
                        centered
                        title="+ Add Board"
                        bgColor={'#121314'}
                        color="white"
                        onClick={onCreateBoard}
                    />
                </Box>
            </Box>
            <Title
                c="white"
                pb="20"
                order={4}
                maw="200"
            >
                Docs
            </Title>
            <Box
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Box
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(auto-fill, ${BOARD_CARD_WIDTH + 10}px)`,
                        maxWidth: '100%',
                    }}
                >
                    {nonArchivedDocs.map((doc) => (
                        <BoardListCard
                            key={doc.id}
                            bgColor={'#121314'}
                            color="white"
                            title={doc.title}
                            onClick={() => onClickDoc(doc.id)}
                        />
                    ))}
                    <BoardListCard
                        centered
                        title="+ Add Document"
                        bgColor={'#121314'}
                        color="white"
                        onClick={onCreateDocument}
                    />
                </Box>
            </Box>
        </Box>
    );
};
