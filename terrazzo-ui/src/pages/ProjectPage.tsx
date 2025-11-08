import { Avatar, Box, Button, Center, Flex, Group, Loader, ScrollArea, Stack, Tabs, Text, Title } from '@mantine/core';
import { Role } from '@mosaiq/terrazzo-common/constants';
import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { Project, ProjectId } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { AvatarRow } from '@trz/components/AvatarRow';
import { NotFound, PageErrors } from '@trz/components/NotFound';
import { ProjectTabCards } from '@trz/components/ProjectTabs/ProjectTabCards';
import { ProjectTabMembers } from '@trz/components/ProjectTabs/ProjectTabMembers';
import { ProjectTabSettings } from '@trz/components/ProjectTabs/ProjectTabSettings';
import { useDashboard } from '@trz/contexts/dashboard-context';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { getProjectData, updateProjectField } from '@trz/emitters';
import { useRoom } from '@trz/hooks/useRoom';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import { setTitle } from '@trz/util/tabUtils';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ProjectPage = (): React.JSX.Element => {
    const params = useParams();
    const sockCtx = useSocket();
    const trz = useTRZ();
    const navigate = useNavigate();
    const { userDash, updateUserDash } = useDashboard();
    const [projectData, setProjectData] = useState<Project | undefined | null>();
    const projectId = params.projectId as ProjectId | undefined;
    const tabId = params.tabId;
    useRoom(RoomType.DATA, projectId, false);

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!projectId || !sockCtx.connected) {
                return;
            }

            try {
                const prj = await getProjectData(sockCtx, projectId);
                setProjectData(prj ?? null);
                setTitle(`${prj?.name ?? 'Project'} | Terrazzo`);
            } catch (err) {
                notify(NoteType.PROJECT_DATA_ERROR, err);
                navigate('/dashboard');
                return;
            }
        };
        fetchProjectData();
    }, [projectId, sockCtx.connected]);

    useSocketListener<ServerSE.UPDATE_PROJECT_FIELD>(ServerSE.UPDATE_PROJECT_FIELD, (payload) => {
        setProjectData((prev) => {
            if (!prev) {
                return prev;
            }
            return updateBaseFromPartial(prev, payload);
        });
    });

    if (projectData === undefined) {
        return <Loader />;
    }

    if (projectData === null || !projectId) {
        return (
            <NotFound
                itemType="project"
                error={PageErrors.NOT_FOUND}
            />
        );
    }

    let myMembershipRecord = userDash?.organizations.find((o) => o.id === projectData.orgId)?.myMembershipRecord;
    const projectMembershipRecord = userDash?.standaloneProjects.find((p) => p.id === projectId)?.myMembershipRecord;
    if (!myMembershipRecord || (myMembershipRecord && projectMembershipRecord && projectMembershipRecord.userRole > myMembershipRecord.userRole)) {
        myMembershipRecord = projectMembershipRecord;
    }

    if (!myMembershipRecord) {
        return (
            <NotFound
                itemType="project"
                error={PageErrors.FORBIDDEN}
            />
        );
    }

    const tabs = {
        Boards: <ProjectTabCards projectData={projectData} />,
        Members: (
            <ProjectTabMembers
                myMembershipRecord={myMembershipRecord}
                projectData={projectData}
            />
        ),
        Settings: (
            <ProjectTabSettings
                myMembershipRecord={myMembershipRecord}
                projectData={projectData}
            />
        ),
    };

    const onChangeTab = (tab: string | null) => {
        if (tab === Object.keys(tabs)[0]) tab = '';
        navigate(`/project/${projectId}/${tab}`);
    };
    const getTab = () => {
        return tabId && tabId in tabs ? tabId : Object.keys(tabs)[0];
    };

    return (
        <ScrollArea h={`calc(100vh - ${trz.navbarHeight}px)`}>
            <Stack
                bg="#15161A"
                mih="100vh"
                pb="10vh"
                align="center"
            >
                <Box
                    py="25"
                    w="80%"
                >
                    <Group
                        gap="xl"
                        pl="50"
                    >
                        <Avatar
                            src={projectData.logoUrl ?? undefined}
                            name={projectData.name}
                            color={'initials'}
                            size={'75'}
                            radius={'lg'}
                        />
                        <Flex direction="column">
                            <Title c="white">{projectData.name}</Title>
                            <Text c="#6C6C6C">{projectData.description}</Text>
                        </Flex>
                    </Group>
                    <Tabs
                        value={getTab()}
                        pt="30"
                        onChange={onChangeTab}
                        color="#F2187E"
                        variant="default"
                    >
                        <Tabs.List>
                            {Object.keys(tabs).map((t) => {
                                return (
                                    <Tabs.Tab
                                        value={t}
                                        key={t}
                                    >
                                        <Text
                                            c="white"
                                            fw="bold"
                                        >
                                            {t}
                                        </Text>
                                    </Tabs.Tab>
                                );
                            })}
                            <Flex
                                ml="auto"
                                align="center"
                            >
                                <AvatarRow
                                    users={projectData.members.map((m) => m.user)}
                                    maxUsers={5}
                                />
                            </Flex>
                        </Tabs.List>
                    </Tabs>
                </Box>
                {!projectData.archived && tabs[getTab()]}
                {projectData.archived && (
                    <Center>
                        <Stack>
                            <Title
                                c="#fff"
                                ta="center"
                                order={3}
                            >
                                This Project is archived
                            </Title>
                            <Button
                                variant="default"
                                disabled={myMembershipRecord.userRole < Role.OWNER}
                                onClick={async () => {
                                    if (myMembershipRecord.userRole < Role.OWNER) {
                                        notify(NoteType.UNAUTHORIZED);
                                        return;
                                    }
                                    try {
                                        updateProjectField(sockCtx, projectId, { archived: false });
                                        notify(NoteType.CHANGES_SAVED);
                                    } catch (e) {
                                        notify(NoteType.PROJECT_DATA_ERROR, e);
                                    }
                                }}
                            >
                                Unarchive Project
                            </Button>
                        </Stack>
                    </Center>
                )}
            </Stack>
        </ScrollArea>
    );
};
export default ProjectPage;
