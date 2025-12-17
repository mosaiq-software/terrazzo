import { Box, Tabs } from '@mantine/core';
import { Member, MembershipRecord, OrganizationHeader, PermissibleAction } from '@mosaiq/terrazzo-common';
import { useOrgPermission } from '@trz/hooks/usePermissions';
import { MdOutlineMailOutline, MdOutlinePerson } from 'react-icons/md';
import { InvitesPanel } from './InvitesPanel';
import { MembersPanel } from './MembersPanel';

interface OrgTabMembersProps {
    myMembershipRecord: MembershipRecord;
    orgData: OrganizationHeader;
    members: Member[];
}

export const OrgTabMembers = (props: OrgTabMembersProps) => {
    const userCanAdmin = useOrgPermission(props.orgData.id, PermissibleAction.AdministerOrg);

    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                width: '100%',
            }}
        >
            <Tabs
                orientation="vertical"
                defaultValue="members"
                keepMounted={false}
                style={{
                    width: '100%',
                }}
            >
                <Tabs.List
                    style={{
                        width: '10rem',
                        color: 'white',
                        gap: 'lg',
                    }}
                >
                    <Tabs.Tab
                        value="members"
                        leftSection={<MdOutlinePerson size={18} />}
                    >
                        Members
                    </Tabs.Tab>
                    {userCanAdmin && (
                        <Tabs.Tab
                            value="invites"
                            leftSection={<MdOutlineMailOutline size={18} />}
                        >
                            Invites
                        </Tabs.Tab>
                    )}
                </Tabs.List>
                <Tabs.Panel value="members">
                    <MembersPanel
                        members={props.members}
                        orgData={props.orgData}
                        userCanAdmin={userCanAdmin}
                    />
                </Tabs.Panel>
                <Tabs.Panel value="invites">
                    <InvitesPanel
                        orgData={props.orgData}
                        userCanAdmin={userCanAdmin}
                    />
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
};
