import React, { useMemo } from 'react';
import { Box, Title } from '@mantine/core';
import { BOARD_CARD_WIDTH, BoardListCard } from '@trz/components/BoardListCards';
import { Organization, ProjectId } from '@mosaiq/terrazzo-common/types';
import { modals } from '@mantine/modals';
import { useNavigate } from 'react-router';
import { createDocument } from '@trz/emitters/all';
import { useSocket } from '@trz/contexts/socket-context';
import { NoteType, notify } from '@trz/util/notifications';

interface OrgTabCardsProps {
    orgData: Organization;
}
export const OrgTabCards = (props: OrgTabCardsProps) => {
    const orgData = props.orgData;
    const navigate = useNavigate();
    const sockCtx = useSocket();

    const nonArchivedProjects = useMemo(() => {
        return orgData?.projects.filter((project) => !project.archived) ?? [];
    }, [orgData?.projects]);

    const nonArchivedDocs = useMemo(() => {
        return orgData?.documents.filter((doc) => !doc.archived) ?? [];
    }, [orgData?.documents]);

    const onCreateProject = () => {
        modals.openContextModal({
            modal: 'project',
            title: 'Create Project',
            innerProps: { parentId: props.orgData.id },
        });
    };

    const onClickProject = (projectId: ProjectId) => {
        navigate(`/project/${projectId}`);
    };

    const onCreateDocument = async () => {
        const doc = await createDocument(sockCtx, 'New Document', props.orgData.id);
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
                Projects
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
                    {nonArchivedProjects.map((project) => (
                        <BoardListCard
                            key={project.id}
                            bgColor={'#121314'}
                            bgImage={project.logoUrl}
                            color="white"
                            title={project.name}
                            onClick={() => onClickProject(project.id)}
                        />
                    ))}
                    <BoardListCard
                        centered
                        title="+ Add Project"
                        bgColor={'#121314'}
                        color="white"
                        onClick={onCreateProject}
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
