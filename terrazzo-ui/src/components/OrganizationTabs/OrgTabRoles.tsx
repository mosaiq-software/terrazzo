import { Box, Button, Text } from '@mantine/core';
import { MembershipRecord, OrganizationHeader, Role, RoleId } from '@mosaiq/terrazzo-common';
import { usePermission } from '@trz/contexts/permission-context';
import { useSocket } from '@trz/contexts/socket-context';
import { Savable, useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { createRoleOnOrg, deleteRole, updateRole } from '@trz/emitters/roleEmitters';
import { generateRandomColor } from '@trz/util/colorUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { useCallback } from 'react';
import { MdAdd } from 'react-icons/md';
import { RoleEditor } from '../Roles/RoleEditor';
import { RoleTabs } from '../Roles/RoleTabs';

interface OrgTabRolesProps {
    myMembershipRecord: MembershipRecord;
    orgData: OrganizationHeader;
    roles: Role[];
}
export const OrgTabRoles = (props: OrgTabRolesProps) => {
    const sockCtx = useSocket();
    const { maxRole, userIsActiveOrgOwner } = usePermission();
    const unsavedCtx = useUnsavedChanges();

    const createNewRole = useCallback(async () => {
        try {
            const randomColor = generateRandomColor();
            const newRole = await createRoleOnOrg(sockCtx, 'new role', randomColor, props.orgData.id);
            if (!newRole) {
                throw new Error('Role creation failed');
            }
            notify(NoteType.CHANGES_SAVED, 'Role created successfully');
        } catch (error) {
            notify(NoteType.GENERIC_ERROR, 'Failed to create role');
        }
    }, [sockCtx, props.orgData.id]);

    const handleSaveRole = useCallback(
        async (updatedRole: Role) => {
            try {
                await updateRole(sockCtx, updatedRole);
                notify(NoteType.CHANGES_SAVED, 'Role updated successfully');
                unsavedCtx.markChangesSaved(Savable.RoleSettings);
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
                unsavedCtx.markChangesSaved(Savable.RoleSettings);
            } catch (error) {
                notify(NoteType.GENERIC_ERROR, 'Failed to delete role');
            }
        },
        [sockCtx]
    );

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
            <RoleTabs
                roles={props.roles}
                disableRolesOnAndBelowIndex={userIsActiveOrgOwner ? -1 : maxRole?.order}
                actionButton={
                    <Button
                        variant="subtle"
                        leftSection={<MdAdd />}
                        onClick={createNewRole}
                        justify="flex-start"
                        px={'1rem'}
                        c="white"
                    >
                        Create Role
                    </Button>
                }
                noSelectionMessage={
                    props.roles.length === 0 ? (
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
                    )
                }
                selectedRolePanel={(role: Role) => (
                    <RoleEditor
                        role={role}
                        onSave={handleSaveRole}
                        onDelete={handleDeleteRole}
                    />
                )}
            />
        </Box>
    );
};
