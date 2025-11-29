import { Accordion, Divider, Fieldset, Stack, Text } from '@mantine/core';
import { OrgMembershipLevel, PermissionLevel, PermissionRecord, UID, UserHeader } from '@mosaiq/terrazzo-common/types';
import { overlayPermissionLevels } from '@mosaiq/terrazzo-common/utils/permissionUtils';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { usePermissions } from '@trz/hooks/usePermissions';
import { useMemo } from 'react';
import { IoMdGlobe } from 'react-icons/io';
import { MdBeachAccess } from 'react-icons/md';
import { PermissionEditorRow } from './PermissionEditorRow';
import { PermissionsEditorAddRow } from './PermissionsEditorAddRow';
import { permissionLevelOptionsAlt } from './PermissionsEditorShared';

interface PermissionsEditorProps {
    moduleId: UID;
    editedPermissionRecord: Partial<PermissionRecord>;
    onChangeRecord: (newRecord: PermissionRecord) => void;
}

export const PermissionsEditor = (props: PermissionsEditorProps) => {
    const trz = useTRZ();
    const { explicitPerms, inheritedPerms, combinedPerms } = usePermissions(props.moduleId);
    const mergedPermissionRecord: PermissionRecord = useMemo(() => {
        return overlayPermissionLevels(combinedPerms, {
            anyonePermissionLevel: props.editedPermissionRecord.anyonePermissionLevel ?? null,
            orgPermissionLevel: props.editedPermissionRecord.orgPermissionLevel ?? null,
            userPermissionLevels: {
                ...props.editedPermissionRecord.userPermissionLevels,
            },
        });
    }, [combinedPerms, props.editedPermissionRecord]);

    const members = useMemo(() => {
        const isOrgAdmin: UserHeader[] = [];
        const hasExplicitPerms: { user: UserHeader; permission: PermissionLevel }[] = [];
        const otherOrgMembers: UserHeader[] = [];

        for (const mem of trz.selectedOrganization?.members || []) {
            const isAdmin = mem.record.permissionLevel === OrgMembershipLevel.ADMIN;
            const level = mergedPermissionRecord.userPermissionLevels[mem.user.id];
            if (isAdmin) {
                isOrgAdmin.push(mem.user);
            } else if (level !== undefined) {
                hasExplicitPerms.push({ user: mem.user, permission: level });
            } else {
                otherOrgMembers.push(mem.user);
            }
        }
        return {
            orgAdmins: isOrgAdmin,
            explicitPerms: hasExplicitPerms,
            others: otherOrgMembers,
        };
    }, [mergedPermissionRecord.userPermissionLevels, trz.selectedOrganization?.members]);

    return (
        <Fieldset legend="Permissions">
            <Stack>
                <Text>Broad Access</Text>
                <PermissionEditorRow
                    title="Anyone on the Internet"
                    icon={IoMdGlobe}
                    permissionLevel={mergedPermissionRecord.anyonePermissionLevel ?? PermissionLevel.NONE}
                    onChangeLevel={(newLevel) => {
                        const newRecord = { ...mergedPermissionRecord, anyonePermissionLevel: newLevel };
                        props.onChangeRecord(newRecord);
                    }}
                    tooltip={`Anyone on the internet ${permissionLevelOptionsAlt[mergedPermissionRecord.anyonePermissionLevel ?? PermissionLevel.NONE]}`}
                    minimumPermissionLevel={inheritedPerms.anyonePermissionLevel ?? PermissionLevel.NONE}
                />
                <PermissionEditorRow
                    title={`Anyone in ${trz.selectedOrganization?.name ?? 'Organization'}`}
                    icon={MdBeachAccess}
                    permissionLevel={mergedPermissionRecord.orgPermissionLevel ?? PermissionLevel.NONE}
                    onChangeLevel={(newLevel) => {
                        const newRecord = { ...mergedPermissionRecord, orgPermissionLevel: newLevel };
                        props.onChangeRecord(newRecord);
                    }}
                    tooltip={`Everyone in ${trz.selectedOrganization?.name ?? 'the organization'} ${permissionLevelOptionsAlt[mergedPermissionRecord.orgPermissionLevel ?? PermissionLevel.NONE]}`}
                    minimumPermissionLevel={inheritedPerms.orgPermissionLevel ?? PermissionLevel.NONE}
                />
                <Divider my={'xs'} />
                <Text>Specific Members</Text>
                {members.explicitPerms.map(({ user, permission }) => {
                    return (
                        <PermissionEditorRow
                            key={user.id}
                            title={fullName(user)}
                            icon={user.profilePicture}
                            permissionLevel={permission}
                            onChangeLevel={(newLevel) => {
                                const newUserPermissionLevels = { ...mergedPermissionRecord.userPermissionLevels, [user.id]: newLevel };
                                const newRecord = { ...mergedPermissionRecord, userPermissionLevels: newUserPermissionLevels };
                                props.onChangeRecord(newRecord);
                            }}
                            tooltip={`${fullName(user)} ${permissionLevelOptionsAlt[permission]}`}
                            minimumPermissionLevel={inheritedPerms.userPermissionLevels[user.id] ?? PermissionLevel.NONE}
                            onDeletePermission={() => {
                                const newUserPermissionLevels = { ...mergedPermissionRecord.userPermissionLevels };
                                delete newUserPermissionLevels[user.id];
                                const newRecord = { ...mergedPermissionRecord, userPermissionLevels: newUserPermissionLevels };
                                props.onChangeRecord(newRecord);
                            }}
                        />
                    );
                })}
                <PermissionsEditorAddRow
                    addableUsers={members.others}
                    onAddUser={(user, level) => {
                        const newUserPermissionLevels = { ...mergedPermissionRecord.userPermissionLevels, [user.id]: level };
                        const newRecord = { ...mergedPermissionRecord, userPermissionLevels: newUserPermissionLevels };
                        props.onChangeRecord(newRecord);
                    }}
                />
                <Divider my={'xs'} />
                <Accordion variant="">
                    <Accordion.Item value="org-admins">
                        <Accordion.Control>Organization Admins ({members.orgAdmins.length})</Accordion.Control>
                        <Accordion.Panel>
                            <Stack gap="xs">
                                <Text
                                    c="dimmed"
                                    fz="sm"
                                >
                                    Organization Admins have full access and cannot have their permissions changed here.
                                </Text>
                                {members.orgAdmins.map((user) => (
                                    <PermissionEditorRow
                                        key={user.id}
                                        title={fullName(user)}
                                        icon={user.profilePicture}
                                        permissionLevel={PermissionLevel.ADMIN}
                                        disabled={true}
                                        onChangeLevel={() => {}}
                                        tooltip="Organization Admins have full access and cannot have their permissions changed here."
                                        minimumPermissionLevel={PermissionLevel.ADMIN}
                                    />
                                ))}
                            </Stack>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </Stack>
        </Fieldset>
    );
};
