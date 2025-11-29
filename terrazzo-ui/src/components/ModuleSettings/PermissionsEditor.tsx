import { Avatar, ComboboxItem, Fieldset, Group, Select, Stack, Text, Tooltip } from '@mantine/core';
import { OrgMembershipLevel, PermissionLevel, PermissionRecord, UID, UserHeader } from '@mosaiq/terrazzo-common/types';
import { overlayPermissionLevels } from '@mosaiq/terrazzo-common/utils/permissionUtils';
import { fullName } from '@mosaiq/terrazzo-common/utils/textUtils';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { usePermissions } from '@trz/hooks/usePermissions';
import { useMemo } from 'react';
import { IoMdGlobe } from 'react-icons/io';
import { MdAdd, MdBeachAccess } from 'react-icons/md';

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
                <PermissionRow
                    title="Anyone on the Internet"
                    icon={<IoMdGlobe />}
                    permissionLevel={mergedPermissionRecord.anyonePermissionLevel ?? PermissionLevel.NONE}
                    onChangeLevel={(newLevel) => {
                        const newRecord = { ...mergedPermissionRecord, anyonePermissionLevel: newLevel };
                        props.onChangeRecord(newRecord);
                    }}
                    tooltip="Anyone with the link has this level of access."
                    minimumPermissionLevel={inheritedPerms.anyonePermissionLevel ?? PermissionLevel.NONE}
                />
                <PermissionRow
                    title={`Anyone in ${trz.selectedOrganization?.name ?? 'Organization'}`}
                    icon={<MdBeachAccess />}
                    permissionLevel={mergedPermissionRecord.orgPermissionLevel ?? PermissionLevel.NONE}
                    onChangeLevel={(newLevel) => {
                        const newRecord = { ...mergedPermissionRecord, orgPermissionLevel: newLevel };
                        props.onChangeRecord(newRecord);
                    }}
                    tooltip={`Everyone in ${trz.selectedOrganization?.name ?? 'the organization'} has this level of access.`}
                    minimumPermissionLevel={inheritedPerms.orgPermissionLevel ?? PermissionLevel.NONE}
                />
                {members.explicitPerms.map(({ user, permission }) => {
                    return (
                        <PermissionRow
                            key={user.id}
                            title={fullName(user)}
                            icon={
                                <Avatar
                                    src={user.profilePicture}
                                    size={20}
                                />
                            }
                            permissionLevel={permission}
                            onChangeLevel={(newLevel) => {
                                const newUserPermissionLevels = { ...mergedPermissionRecord.userPermissionLevels, [user.id]: newLevel };
                                const newRecord = { ...mergedPermissionRecord, userPermissionLevels: newUserPermissionLevels };
                                props.onChangeRecord(newRecord);
                            }}
                            tooltip={`${fullName(user)} has this specific permission level.`}
                            minimumPermissionLevel={inheritedPerms.userPermissionLevels[user.id] ?? PermissionLevel.NONE}
                        />
                    );
                })}
                <AddMemberRow
                    addableUsers={members.others}
                    onAddUser={(user, level) => {
                        const newUserPermissionLevels = { ...mergedPermissionRecord.userPermissionLevels, [user.id]: level };
                        const newRecord = { ...mergedPermissionRecord, userPermissionLevels: newUserPermissionLevels };
                        props.onChangeRecord(newRecord);
                    }}
                />
                {/* Show admins as disabled rows */}
                {members.orgAdmins.map((user) => (
                    <PermissionRow
                        key={user.id}
                        title={fullName(user)}
                        icon={
                            <Avatar
                                src={user.profilePicture}
                                size={20}
                            />
                        }
                        permissionLevel={PermissionLevel.ADMIN}
                        disabled={true}
                        onChangeLevel={() => {}}
                        tooltip="Organization Admins have full access and cannot have their permissions changed here."
                        minimumPermissionLevel={PermissionLevel.ADMIN}
                    />
                ))}
            </Stack>
        </Fieldset>
    );
};

interface PermissionRowProps {
    title: string;
    icon?: React.ReactNode;
    permissionLevel: PermissionLevel;
    minimumPermissionLevel: PermissionLevel;
    disabled?: boolean;
    tooltip?: string;
    onChangeLevel: (newLevel: PermissionLevel) => void;
}
const PermissionRow = (props: PermissionRowProps) => {
    const data: ComboboxItem[] = permissionLevelOptions.map((value, index) => ({
        value: index.toString(),
        label: value.toString(),
        disabled: index < props.minimumPermissionLevel,
    }));
    return (
        <Tooltip
            label={props.tooltip ?? ''}
            disabled={!props.tooltip}
            withArrow
            openDelay={200}
        >
            <Group
                bg={props.disabled ? '#00000020' : undefined}
                px={10}
                py={5}
            >
                {props.icon}
                <Text>{props.title}</Text>
                <Select
                    label={props.minimumPermissionLevel ? `At least ${permissionLevelOptions[props.minimumPermissionLevel]} (inherited from parent directory)` : undefined}
                    disabled={props.disabled}
                    data={data}
                    value={props.permissionLevel.toString()}
                    onChange={(value) => {
                        const newLevel = Number(value) as PermissionLevel;
                        props.onChangeLevel(newLevel);
                    }}
                />
            </Group>
        </Tooltip>
    );
};

interface AddMemberRowProps {
    addableUsers: UserHeader[];
    onAddUser: (user: UserHeader, level: PermissionLevel) => void;
}
const AddMemberRow = (props: AddMemberRowProps) => {
    if (props.addableUsers.length === 0) {
        return null;
    }
    return (
        <Group>
            <MdAdd />
            <Select
                label="Add Member"
                placeholder="Select a user to add"
                data={props.addableUsers.map((user) => ({ value: user.id, label: fullName(user) }))}
                onChange={(value) => {
                    const userToAdd = props.addableUsers.find((user) => user.id === value);
                    if (userToAdd) {
                        props.onAddUser(userToAdd, PermissionLevel.VIEW);
                    }
                }}
            />
        </Group>
    );
};

const permissionLevelOptions = ['No Access', 'Viewer', 'Editor', 'Admin'];
