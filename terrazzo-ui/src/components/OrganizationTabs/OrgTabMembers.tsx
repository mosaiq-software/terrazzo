import { Box, Group, Stack, Tabs, Title } from '@mantine/core';
import { MembershipRecord, Organization } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { MdOutlineMailOutline, MdOutlinePerson } from 'react-icons/md';

interface OrgTabMembersProps {
    myMembershipRecord: MembershipRecord;
    orgData: Organization;
}
export const OrgTabMembers = (props: OrgTabMembersProps) => {
    const sockCtx = useSocket();
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
            <Group
                w="100%"
                justify="space-between"
            >
                <Title
                    c="white"
                    pb="20"
                    order={4}
                    maw="200"
                >
                    Members
                </Title>
            </Group>
            <Tabs
                orientation="vertical"
                defaultValue="members"
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
                        Members ({props.orgData.members.length})
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="invites"
                        leftSection={<MdOutlineMailOutline size={18} />}
                    >
                        Invites ({props.orgData.invites.length})
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="members">
                    <Stack
                        px={'md'}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Title
                            order={4}
                            c="#fff"
                        >
                            Members
                        </Title>
                    </Stack>
                </Tabs.Panel>
                <Tabs.Panel value="invites">
                    <Stack
                        px={'md'}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Title
                            order={4}
                            c="#fff"
                        >
                            Pending Invites
                        </Title>
                    </Stack>
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
};
