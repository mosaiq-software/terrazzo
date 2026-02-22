import { ActionIcon, Box, Collapse, Group, Menu, Text } from '@mantine/core';
import { useHover, useLocalStorage } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { ModuleHeader, PermissibleAction, TrzModule, UID } from '@mosaiq/terrazzo-common';
import { useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { useModulePermission } from '@trz/hooks/data/usePermissions';
import { useModuleChildren } from '@trz/hooks/useModuleChildren';
import { COLORS } from '@trz/util/colors';
import { captureAllEvents, completelyCaptureEvent } from '@trz/util/eventUtils';
import { getModuleRelativeUrl } from '@trz/util/moduleUtils';
import { useContextMenu } from 'mantine-contextmenu';
import { useMemo, useState } from 'react';
import { MdAdd, MdSettings } from 'react-icons/md';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { DirectoryListItemContextMenu } from './DirectoryListItemContextMenu';
import { DirectoryListItemIcon } from './DirectoryListItemIcon';
import EditableTextbox from '@trz/components/UI/EditableTextbox';
import { updateDirectoryMetadata } from '@trz/emitters/directoryEmitters';
import { updateBoardField, updateDocumentMetadata } from '@trz/emitters';
import { useSocket } from '@trz/contexts/socket-context';

interface DirectoryTreeItemProps {
    directoryListItem: ModuleHeader;
    visible: boolean;
    addItem: (toParentId: UID, type: TrzModule) => Promise<void>;
}
export const DirectoryTreeItem = (props: DirectoryTreeItemProps) => {
    const sockCtx = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const { showContextMenu } = useContextMenu();
    const { hovered, ref: hoverRef } = useHover();
    const [actionMenu, setActionMenu] = useState<'add' | undefined>(undefined);
    const unsavedCtx = useUnsavedChanges();
    const contents = useModuleChildren(props.visible ? props.directoryListItem.id : undefined);
    const [collapsed, setCollapsed, deleteCollapsed] = useLocalStorage<boolean | undefined>({
        key: `directory-tree-item-collapsed-${props.directoryListItem.id}`,
        defaultValue: undefined,
    });

    const selected = location.pathname.includes(props.directoryListItem.id);

    const userCanManageModules = useModulePermission(props.directoryListItem, PermissibleAction.ManageModules);

    const creationMenuItems: { id: TrzModule; label: string }[] = useMemo(() => {
        const items: { id: TrzModule; label: string }[] = [];
        if (userCanManageModules) {
            items.push({ id: TrzModule.Directory, label: 'Directory' });
            items.push({ id: TrzModule.Board, label: 'Board' });
            items.push({ id: TrzModule.Document, label: 'Document' });
        }
        return items;
    }, [userCanManageModules]);

    const showCreateOptions = creationMenuItems.length > 0;
    const showEditOptions = userCanManageModules;

    const handleClick = async () => {
        if (collapsed) {
            deleteCollapsed();
        } else {
            setCollapsed(true);
        }
        if (await unsavedCtx.confirmKeepUnsavedChanges()) {
            return;
        }
        const url = getModuleRelativeUrl(props.directoryListItem.type, props.directoryListItem.id);
        navigate(url);
    };

    const onDirectoryItemNameChange = async (value: string) => {
        if (!value) return;
        try {
            switch (props.directoryListItem.type) {
                case 'board':
                    await updateBoardField(sockCtx, props.directoryListItem.id, {
                        name: value,
                    });
                    break;
                case 'directory':
                    await updateDirectoryMetadata(sockCtx, props.directoryListItem.id, {
                        name: value,
                    });
                    break;
                case 'document':
                    await updateDocumentMetadata(sockCtx, props.directoryListItem.id, {
                        name: value,
                    });
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    };

    if (props.directoryListItem.archived) {
        return null;
    }

    return (
        <Box>
            <Group
                align="center"
                justify="space-between"
                wrap="nowrap"
                w="100%"
                gap={0}
                px={0}
                onClick={handleClick}
                bg={selected ? COLORS.background.light : hovered ? COLORS.background.medium : COLORS.transparent}
                style={{
                    cursor: 'pointer',
                    borderRadius: '0.2rem',
                    padding: '0.2rem',
                }}
                onContextMenuCapture={showContextMenu((close) => (
                    <DirectoryListItemContextMenu
                        onClose={close}
                        moduleHeader={props.directoryListItem}
                        parentId={props.directoryListItem.id}
                        parentName={props.directoryListItem.name}
                        allowAddItem={props.directoryListItem.type === TrzModule.Directory}
                        addItem={props.addItem}
                    />
                ))}
                ref={hoverRef}
            >
                <DirectoryListItemIcon
                    moduleType={props.directoryListItem.type}
                    collapsed={!!collapsed}
                    subItemsCount={contents?.length}
                />
                {/*<Text
                    c={COLORS.text.primary}
                    style={{
                        textWrap: 'nowrap',
                        textAlign: 'left',
                        width: '100%',
                        paddingLeft: '5px',
                    }}
                >
                    {props.directoryListItem.name}
                </Text>*/}
                <EditableTextbox
                    value={props.directoryListItem.name}
                    onChange={onDirectoryItemNameChange}
                    type="title"
                    placeholder="Item name.."
                    titleProps={{
                        order: 5,
                        textWrap: 'nowrap',
                        fw: 400,
                        style: {
                            width: 0,
                            flexGrow: 1,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                        },
                    }}
                    inputProps={{
                        bg: COLORS.transparent,
                        variant: 'filled',
                        size: 'xs',
                        styles: {
                            input: { fontSize: '1rem' },
                        },
                        required: true,
                    }}
                    style={{
                        width: '100%',
                        paddingLeft: '5px',
                    }}
                    doubleClick={true}
                />
                <Group
                    gap={0}
                    wrap="nowrap"
                    style={{
                        visibility: hovered || actionMenu !== undefined ? 'visible' : 'hidden',
                    }}
                >
                    {showCreateOptions && (
                        <Menu
                            withArrow
                            position="bottom-end"
                            shadow="md"
                            closeOnItemClick
                            closeOnClickOutside
                            opened={actionMenu === 'add'}
                            onOpen={() => setActionMenu('add')}
                            onClose={() => setActionMenu(undefined)}
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
                                            e.stopPropagation();
                                            props.addItem(props.directoryListItem.id, item.id);
                                        }}
                                    >
                                        {item.label}
                                    </Menu.Item>
                                ))}
                            </Menu.Dropdown>
                        </Menu>
                    )}
                    {showEditOptions && (
                        <ActionIcon
                            variant="subtle"
                            c="white"
                            onClick={(e) => {
                                e.stopPropagation();
                                modals.openContextModal({
                                    modal: 'moduleSettings',
                                    title: 'Settings',
                                    innerProps: { moduleHeader: props.directoryListItem },
                                    size: 'xl',
                                });
                            }}
                        >
                            <MdSettings />
                        </ActionIcon>
                    )}
                </Group>
            </Group>
            <Collapse in={!collapsed && props.visible}>
                <Box
                    style={{
                        paddingLeft: 7.5,
                    }}
                >
                    <Box
                        style={{
                            borderLeft: `1px solid ${COLORS.background.medium}`,
                            paddingLeft: 10,
                        }}
                    >
                        {contents?.map((subItem) => {
                            return (
                                <DirectoryTreeItem
                                    key={subItem.id}
                                    directoryListItem={subItem}
                                    visible={!collapsed && props.visible}
                                    addItem={props.addItem}
                                />
                            );
                        })}
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};
