import { Avatar, Box, Button, Center, Flex, Group, Loader, ScrollArea, Stack, Tabs, Text, Title } from '@mantine/core';
import { Role } from '@mosaiq/terrazzo-common/constants';
import { RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { Organization, OrganizationId } from '@mosaiq/terrazzo-common/types';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { AvatarRow } from '@trz/components/AvatarRow';
import { NotFound, PageErrors } from '@trz/components/NotFound';
import { OrgTabCards } from '@trz/components/OrganizationTabs/OrgTabCards';
import { OrgTabMembers } from '@trz/components/OrganizationTabs/OrgTabMembers';
import { OrgTabSettings } from '@trz/components/OrganizationTabs/OrgTabSettings';
import { useDashboard } from '@trz/contexts/dashboard-context';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { getOrganizationData, updateOrgField } from '@trz/emitters';
import { useRoom } from '@trz/hooks/useRoom';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { NoteType, notify } from '@trz/util/notifications';
import { setTitle } from '@trz/util/tabUtils';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const OrganizationPage = (): React.JSX.Element => {
    const params = useParams();
    const sockCtx = useSocket();
    const trz = useTRZ();
    const navigate = useNavigate();
    const [orgData, setOrgData] = useState<Organization | undefined | null>();
    const { userDash, updateUserDash } = useDashboard();
    const orgId = params.orgId as OrganizationId | undefined;
    const tabId = params.tabId;
    const myMembershipRecord = userDash?.organizations.find((o) => o.id === orgId)?.myMembershipRecord;
    useRoom(RoomType.DATA, orgId, false);

    useEffect(() => {
        const fetchOrgData = async () => {
            if (!orgId || !sockCtx.connected) {
                return;
            }
            try {
                const org = await getOrganizationData(sockCtx, orgId);
                setOrgData(org ?? null);
                setTitle(`${org?.name ?? 'Organization'} | Terrazzo`);
            } catch (err) {
                notify(NoteType.ORG_DATA_ERROR, err);
                navigate('/dashboard');
                return;
            }
        };
        fetchOrgData();
    }, [orgId, sockCtx.connected]);

    useSocketListener<ServerSE.UPDATE_ORG_FIELD>(ServerSE.UPDATE_ORG_FIELD, (payload) => {
        setOrgData((prev) => {
            if (!prev) {
                return prev;
            }
            return updateBaseFromPartial(prev, payload);
        });
    });

    if (orgData === undefined) {
        return <Loader />;
    }
    if (orgData === null || !orgId) {
        return (
            <NotFound
                itemType="organization"
                error={PageErrors.NOT_FOUND}
            />
        );
    }
    if (!myMembershipRecord) {
        return (
            <NotFound
                itemType="organization"
                error={PageErrors.FORBIDDEN}
            />
        );
    }

    const tabs: any = {
        Organization: <OrgTabCards orgData={orgData} />,
        Members: (
            <OrgTabMembers
                myMembershipRecord={myMembershipRecord}
                orgData={orgData}
            />
        ),
        Settings: (
            <OrgTabSettings
                myMembershipRecord={myMembershipRecord}
                orgData={orgData}
            />
        ),
    };

    const onChangeTab = (tab: string | null) => {
        if (tab === Object.keys(tabs)[0]) tab = '';
        navigate(`/org/${orgId}/${tab}`);
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
                            src={orgData.logoUrl ?? undefined}
                            name={orgData.name}
                            color={'initials'}
                            size={'75'}
                            radius={'lg'}
                        />
                        <Flex direction="column">
                            <Title c="white">{orgData.name}</Title>
                            <Text c="#6C6C6C">{orgData.description}</Text>
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
                                    users={orgData.members.map((m) => m.user)}
                                    maxUsers={5}
                                />
                            </Flex>
                        </Tabs.List>
                    </Tabs>
                </Box>
                {!orgData.archived && tabs[getTab()]}
                {orgData.archived && (
                    <Center>
                        <Stack>
                            <Title
                                c="#fff"
                                ta="center"
                                order={3}
                            >
                                This Organization is archived
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
                                        updateOrgField(sockCtx, orgId, { archived: false });
                                        notify(NoteType.CHANGES_SAVED);
                                    } catch (e) {
                                        notify(NoteType.ORG_DATA_ERROR, e);
                                    }
                                }}
                            >
                                Unarchive Organization
                            </Button>
                        </Stack>
                    </Center>
                )}
            </Stack>
        </ScrollArea>
    );
};
export default OrganizationPage;
