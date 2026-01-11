import { Avatar, Box, Flex, Group, Loader, ScrollArea, Stack, Tabs, Text, Title } from '@mantine/core';
import { OrganizationId, PermissibleAction, withIf } from '@mosaiq/terrazzo-common';
import { OrgTabArchive } from '@trz/components/OrganizationTabs/OrgTabArchive';
import { OrgTabCards } from '@trz/components/OrganizationTabs/OrgTabCards';
import { OrgTabMembers } from '@trz/components/OrganizationTabs/OrgTabMembers';
import { OrgTabRoles } from '@trz/components/OrganizationTabs/OrgTabRoles';
import { OrgTabSettings } from '@trz/components/OrganizationTabs/OrgTabSettings';
import { AvatarRow } from '@trz/components/UI/AvatarRow';
import { NotFound, PageErrors } from '@trz/components/UI/NotFound';
import { useOrg } from '@trz/contexts/org-context';
import { useUI } from '@trz/contexts/ui-context';
import { useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { useUserContext } from '@trz/contexts/user-context';
import { useOrgPermission } from '@trz/hooks/usePermissions';
import { setTitle } from '@trz/util/tabUtils';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const OrganizationPage = (): React.JSX.Element => {
    const params = useParams();
    const uiCtx = useUI();
    const userCtx = useUserContext();
    const navigate = useNavigate();
    const orgId = params.orgId as OrganizationId | undefined;
    const tabId = params.tabId;
    const orgCtx = useOrg();
    const unsavedCtx = useUnsavedChanges();
    const userCanEditRoles = useOrgPermission(orgId, PermissibleAction.EditRoles);
    const userCanEditRootDirectory = useOrgPermission(orgId, PermissibleAction.EditDirectory);

    setTitle(`${orgCtx.active?.name ?? 'Organization'} | Terrazzo`);

    if (orgCtx.active === undefined) {
        return <Loader />;
    }
    if (orgCtx.active === null || !orgId) {
        return (
            <NotFound
                itemType="organization"
                error={PageErrors.NOT_FOUND}
            />
        );
    }

    const myMembership = orgCtx.members.find((m) => m.user.id === userCtx.userId);
    if (!myMembership) {
        return (
            <NotFound
                itemType="organization"
                error={PageErrors.UNAUTHORIZED}
            />
        );
    }

    const onChangeTab = async (tab: string | null) => {
        if (tab === 'Organization') tab = '';
        if (tab === tabId || (await unsavedCtx.confirmKeepUnsavedChanges())) {
            return;
        }
        navigate(`/org/${orgId}/${tab}`);
    };
    const getTab = () => {
        return tabId || 'Organization';
    };

    return (
        <ScrollArea h={`calc(100vh - ${uiCtx.navbarHeight}px)`}>
            <Group
                gap={0}
                justify="center"
                w="100%"
            >
                <Stack
                    bg="#15161A"
                    mih="100vh"
                    pb="10vh"
                    align="center"
                    w="80%"
                >
                    <Box
                        py="25"
                        w="100%"
                    >
                        <Group
                            gap="xl"
                            pl="50"
                        >
                            <Avatar
                                src={orgCtx.active.logoUrl ?? undefined}
                                name={orgCtx.active.name}
                                color={'initials'}
                                size={'75'}
                                radius={'lg'}
                            />
                            <Flex direction="column">
                                <Title c="white">{orgCtx.active.name}</Title>
                                <Text c="#6C6C6C">{orgCtx.active.description}</Text>
                            </Flex>
                        </Group>
                        <Tabs
                            value={getTab()}
                            pt="30"
                            onChange={onChangeTab}
                            color="#F2187E"
                            variant="default"
                            keepMounted={false}
                        >
                            <Tabs.List>
                                {[
                                    'Organization',
                                    'Members',
                                    ...withIf('Roles', userCanEditRoles),
                                    'Settings',
                                    ...withIf('Archive', userCanEditRootDirectory),
                                ].map((t) => {
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
                                        users={orgCtx.members.map((m) => m.user)}
                                        maxUsers={5}
                                        showProfilePopover
                                        showTooltip
                                        animateOnHover
                                    />
                                </Flex>
                            </Tabs.List>
                            <Tabs.Panel value="Organization">
                                <OrgTabCards orgData={orgCtx.active} />
                            </Tabs.Panel>
                            <Tabs.Panel value="Members">
                                <OrgTabMembers
                                    myMembershipRecord={myMembership}
                                    orgData={orgCtx.active}
                                    members={orgCtx.members}
                                />
                            </Tabs.Panel>
                            <Tabs.Panel value="Roles">
                                {userCanEditRoles ? (
                                    <OrgTabRoles
                                        myMembershipRecord={myMembership}
                                        orgData={orgCtx.active}
                                        roles={orgCtx.roles}
                                    />
                                ) : (
                                    <NotFound
                                        itemType="organization roles"
                                        error={403}
                                    />
                                )}
                            </Tabs.Panel>
                            <Tabs.Panel value="Settings">
                                <OrgTabSettings
                                    myMembershipRecord={myMembership}
                                    orgData={orgCtx.active}
                                />
                            </Tabs.Panel>
                            <Tabs.Panel value="Archive">
                                {userCanEditRootDirectory ? (
                                    <OrgTabArchive orgId={orgCtx.active.id} />
                                ) : (
                                    <NotFound
                                        itemType="organization archive"
                                        error={403}
                                    />
                                )}
                            </Tabs.Panel>
                        </Tabs>
                    </Box>
                </Stack>
            </Group>
        </ScrollArea>
    );
};
export default OrganizationPage;
