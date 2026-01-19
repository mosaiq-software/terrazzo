import { ActionIcon, Group, Menu, Stack } from '@mantine/core';
import { OrganizationId, PermissibleAction, TrzModuleType, UID, withIf } from '@mosaiq/terrazzo-common';
import { useDirectoryContents } from '@trz/hooks/useDirectoryContents';
import { useOrgPermission } from '@trz/hooks/usePermissions';
import { captureAllEvents, completelyCaptureEvent } from '@trz/util/eventUtils';
import { useMemo } from 'react';
import { MdAdd } from 'react-icons/md';
import { DirectoryTreeItem } from './DirectoryTreeItem';

interface DirectoryTreeProps {
    orgId: OrganizationId | undefined;
    addItem: (toParentId: UID, type: TrzModuleType) => Promise<void>;
}
export const DirectoryTree = (props: DirectoryTreeProps) => {
    const contents = useDirectoryContents(props.orgId, TrzModuleType.Organization);

    const userCanCreateBoardsOrg = useOrgPermission(props.orgId, PermissibleAction.CreateBoard);
    const userCanCreateDocumentsOrg = useOrgPermission(props.orgId, PermissibleAction.CreateDocument);
    const userCanCreateDirectoriesOrg = useOrgPermission(props.orgId, PermissibleAction.CreateDirectory);

    const creationMenuItems: { id: TrzModuleType; label: string }[] = useMemo(() => {
        const items: { id: TrzModuleType; label: string }[] = [
            ...withIf({ id: TrzModuleType.Directory, label: 'Directory' }, userCanCreateDirectoriesOrg),
            ...withIf({ id: TrzModuleType.Board, label: 'Board' }, userCanCreateBoardsOrg),
            ...withIf({ id: TrzModuleType.Document, label: 'Document' }, userCanCreateDocumentsOrg),
        ];
        return items;
    }, [userCanCreateBoardsOrg, userCanCreateDocumentsOrg, userCanCreateDirectoriesOrg]);
    const showCreateOptions = creationMenuItems.length > 0;

    if (!props.orgId || !contents) {
        return null;
    }

    return (
        <Stack
            gap={0}
            p={0}
        >
            {contents.map((item) => {
                if (item.type !== TrzModuleType.Directory && !item.canAccess) {
                    return null;
                }
                return (
                    <DirectoryTreeItem
                        key={item.id}
                        directoryListItem={item}
                        indent={0}
                        visible={true}
                        addItem={props.addItem}
                    />
                );
            })}
            <Group
                w="100%"
                justify="center"
                py="lg"
            >
                {showCreateOptions && (
                    <Menu
                        withArrow
                        shadow="md"
                        closeOnItemClick
                        closeOnClickOutside
                    >
                        <Menu.Target>
                            <ActionIcon
                                variant="subtle"
                                c="white"
                                {...captureAllEvents(completelyCaptureEvent)}
                            >
                                <MdAdd />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {creationMenuItems.map((item) => (
                                <Menu.Item
                                    key={item.id}
                                    onClick={(e) => {
                                        if (!props.orgId) return;
                                        props.addItem(props.orgId, item.id);
                                    }}
                                >
                                    {item.label}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                )}
            </Group>
        </Stack>
    );
};
