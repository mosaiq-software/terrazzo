import { Button, Group, Menu, Stack } from '@mantine/core';
import { OrganizationId, PermissibleAction, TrzModule, UID } from '@mosaiq/terrazzo-common';
import { useModuleChildren } from '@trz/hooks/useModuleChildren';
import { useOrgPermission } from '@trz/hooks/usePermissions';
import { useMemo } from 'react';
import { MdAdd } from 'react-icons/md';
import { DirectoryTreeItem } from './DirectoryTreeItem';

interface DirectoryTreeProps {
    orgId: OrganizationId | undefined;
    addItem: (toParentId: UID, type: TrzModule) => Promise<void>;
}
export const DirectoryTree = (props: DirectoryTreeProps) => {
    const contents = useModuleChildren(props.orgId);

    const userCanManageModulesOrg = useOrgPermission(props.orgId, PermissibleAction.ManageModules);

    const creationMenuItems: { id: TrzModule; label: string }[] = useMemo(() => {
        const items: { id: TrzModule; label: string }[] = [];
        if (userCanManageModulesOrg) {
            items.push({ id: TrzModule.Directory, label: 'Directory' });
            items.push({ id: TrzModule.Board, label: 'Board' });
            items.push({ id: TrzModule.Document, label: 'Document' });
        }
        return items;
    }, [userCanManageModulesOrg]);

    if (!props.orgId || !contents) {
        return null;
    }

    return (
        <Stack
            gap={0}
            p={0}
        >
            {contents.map((item) => {
                return (
                    <DirectoryTreeItem
                        key={item.id}
                        directoryListItem={item}
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
                {creationMenuItems.length > 0 && (
                    <Menu
                        withArrow
                        shadow="md"
                        closeOnItemClick
                        closeOnClickOutside
                    >
                        <Menu.Target>
                            <Button
                                variant="subtle"
                                c="white"
                                fullWidth
                            >
                                <MdAdd />
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {creationMenuItems.map((item) => (
                                <Menu.Item
                                    key={item.id}
                                    onClick={() => {
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
