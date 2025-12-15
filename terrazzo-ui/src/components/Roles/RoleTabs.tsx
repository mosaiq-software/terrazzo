import { Box, Center, Group, Tabs, Text, Title } from '@mantine/core';
import { Role } from '@mosaiq/terrazzo-common';
import { useState } from 'react';
import { MdCircle } from 'react-icons/md';

interface RoleTabProps {
    roles: Role[];
    actionButton?: React.ReactNode;
    noSelectionMessage?: React.ReactNode;
    selectedRolePanel: (role: Role) => React.ReactNode;
    disableRolesOnAndBelowIndex?: number;
}
export const RoleTabs = (props: RoleTabProps) => {
    const [activeTab, setActiveTab] = useState<string | null>('no-role-selected');

    return (
        <Box
            style={{
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
                    Roles
                </Title>
            </Group>
            <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={setActiveTab}
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
                    {props.roles.map((role, index) => {
                        return (
                            <Tabs.Tab
                                key={role.id}
                                value={role.id}
                                leftSection={
                                    <MdCircle
                                        size={18}
                                        color={role.color}
                                    />
                                }
                                maw="10rem"
                                style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                disabled={index <= (props.disableRolesOnAndBelowIndex || 0)}
                            >
                                {role.name}
                            </Tabs.Tab>
                        );
                    })}
                    {props.actionButton}
                </Tabs.List>
                {props.roles.map((role, index) => {
                    return (
                        <Tabs.Panel
                            key={role.id}
                            value={role.id}
                        >
                            {props.selectedRolePanel(role)}
                        </Tabs.Panel>
                    );
                })}
                <Tabs.Panel value="no-role-selected">
                    <Center
                        w="100%"
                        h="100%"
                        p="md"
                    >
                        {props.noSelectionMessage || <Text c="dimmed">No role selected</Text>}
                    </Center>
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
};
