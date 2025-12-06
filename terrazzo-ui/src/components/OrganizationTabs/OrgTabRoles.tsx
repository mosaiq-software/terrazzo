import { Box, Button, Center, Group, Tabs, Text, Title } from '@mantine/core';
import { MembershipRecord, OrganizationHeader, Role, RoleId } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { createRoleOnOrg, deleteRole, updateRole } from '@trz/emitters/roleEmitters';
import { generateRandomColor } from '@trz/util/colorUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { useCallback, useState } from 'react';
import { MdAdd, MdCircle } from 'react-icons/md';
import { RoleEditor } from '../Roles/RoleEditor';

interface OrgTabRolesProps {
    myMembershipRecord: MembershipRecord;
    orgData: OrganizationHeader;
    roles: Role[];
}
export const OrgTabRoles = (props: OrgTabRolesProps) => {
    const sockCtx = useSocket();
    const [activeTab, setActiveTab] = useState<string | null>('no-role-selected');

    const createNewRole = useCallback(async () => {
        try {
            const randomColor = generateRandomColor();
            const newRole = await createRoleOnOrg(sockCtx, 'new role', randomColor, props.orgData.id);
            if (!newRole) {
                throw new Error('Role creation failed');
            }
            notify(NoteType.CHANGES_SAVED, 'Role created successfully');
            setActiveTab(newRole.id);
        } catch (error) {
            notify(NoteType.GENERIC_ERROR, 'Failed to create role');
        }
    }, [sockCtx, props.orgData.id]);

    const handleSaveRole = useCallback(
        async (updatedRole: Role) => {
            try {
                await updateRole(sockCtx, updatedRole);
                notify(NoteType.CHANGES_SAVED, 'Role updated successfully');
            } catch (error) {
                notify(NoteType.GENERIC_ERROR, 'Failed to save role changes');
            }
        },
        [sockCtx]
    );

    const handleDeleteRole = useCallback(
        async (roleId: RoleId) => {
            try {
                await deleteRole(sockCtx, roleId);
                notify(NoteType.CHANGES_SAVED, 'Role deleted successfully');
                setActiveTab('no-role-selected');
            } catch (error) {
                notify(NoteType.GENERIC_ERROR, 'Failed to delete role');
            }
        },
        [sockCtx]
    );

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
                    {props.roles.map((role) => (
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
                        >
                            {role.name}
                        </Tabs.Tab>
                    ))}
                    <Button
                        variant="subtle"
                        leftSection={<MdAdd />}
                        onClick={createNewRole}
                        justify="flex-start"
                        px={'1rem'}
                        c="white"
                    >
                        Add Role
                    </Button>
                </Tabs.List>
                {props.roles.map((role) => (
                    <Tabs.Panel
                        key={role.id}
                        value={role.id}
                    >
                        <RoleEditor
                            role={role}
                            onSave={handleSaveRole}
                            onDelete={handleDeleteRole}
                        />
                    </Tabs.Panel>
                ))}
                <Tabs.Panel value="no-role-selected">
                    <Center
                        w="100%"
                        h="100%"
                    >
                        {props.roles.length === 0 ? (
                            <Button
                                variant="subtle"
                                c="white"
                                leftSection={<MdAdd />}
                                onClick={createNewRole}
                            >
                                Create a new role to get started
                            </Button>
                        ) : (
                            <Text c="subtle">Select a role to view or edit its details.</Text>
                        )}
                    </Center>
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
};
