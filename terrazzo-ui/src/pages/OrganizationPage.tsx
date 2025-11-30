import { Avatar, Box, Flex, Group, Loader, ScrollArea, Stack, Tabs, Text, Title } from '@mantine/core';
import { OrganizationId } from '@mosaiq/terrazzo-common/types';
import { AvatarRow } from '@trz/components/AvatarRow';
import { NotFound, PageErrors } from '@trz/components/NotFound';
import { OrgTabCards } from '@trz/components/OrganizationTabs/OrgTabCards';
import { OrgTabMembers } from '@trz/components/OrganizationTabs/OrgTabMembers';
import { OrgTabSettings } from '@trz/components/OrganizationTabs/OrgTabSettings';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { useUser } from '@trz/contexts/user-context';
import { useOrganization } from '@trz/hooks/useOrganization';
import { setTitle } from '@trz/util/tabUtils';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const OrganizationPage = (): React.JSX.Element => {
    const params = useParams();
    const trz = useTRZ();
    const userCtx = useUser();
    const navigate = useNavigate();
    const orgId = params.orgId as OrganizationId | undefined;
    const tabId = params.tabId;
    const { orgData } = useOrganization(orgId);
    setTitle(`${orgData?.name ?? 'Organization'} | Terrazzo`);

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

    const myMembershipRecord = orgData.members.find((m) => m.user.id === userCtx.userData?.id)?.record;
    if (!myMembershipRecord) {
        return (
            <NotFound
                itemType="organization"
                error={PageErrors.UNAUTHORIZED}
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
                {tabs[getTab()]}
            </Stack>
        </ScrollArea>
    );
};
export default OrganizationPage;
