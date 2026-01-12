import { Button, Group, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { ModuleHeader, TrzModuleType } from '@mosaiq/terrazzo-common';
import { useUI } from '@trz/contexts/ui-context';
import { useUnsavedChanges } from '@trz/contexts/unsaved-changes-context';
import { useDirectoryContents } from '@trz/hooks/useDirectoryContents';
import { getModuleRelativeUrl } from '@trz/util/moduleUtils';
import { useContextMenu } from 'mantine-contextmenu';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { DirectoryListItemContextMenu } from './DirectoryListItemContextMenu';
import { DirectoryListItemIcon } from './DirectoryListItemIcon';

interface DirectoryTreeItemProps {
    sidebarCollapsed: boolean;
    directoryListItem: ModuleHeader;
    indent: number;
    visible: boolean;
}
export const DirectoryTreeItem = (props: DirectoryTreeItemProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showContextMenu } = useContextMenu();
    const uiCtx = useUI();
    const unsavedCtx = useUnsavedChanges();
    const contents = useDirectoryContents(
        props.visible ? props.directoryListItem.id : undefined,
        props.directoryListItem.type
    );
    const [collapsed, setCollapsed, deleteCollapsed] = useLocalStorage<boolean | undefined>({
        key: `directory-tree-item-collapsed-${props.directoryListItem.id}`,
        defaultValue: undefined,
    });

    const selected = location.pathname.includes(props.directoryListItem.id);

    const handleClick = async () => {
        if (props.directoryListItem.type === TrzModuleType.Directory) {
            if (collapsed) {
                deleteCollapsed();
            } else {
                setCollapsed(true);
            }
            return;
        }
        if (await unsavedCtx.confirmKeepUnsavedChanges()) {
            return;
        }
        const url = getModuleRelativeUrl(props.directoryListItem.type, props.directoryListItem.id);
        navigate(url);
    };

    if (props.directoryListItem.archived) {
        return null;
    }

    return (
        <>
            <Group
                align="center"
                justify="flex-start"
                p="0"
                pl={`${props.indent * 15}px`}
                ml="sm"
                style={{
                    overflow: 'hidden',
                    width: props.sidebarCollapsed ? '0px' : '100%',
                    height: props.sidebarCollapsed ? '0px' : '36px',
                    transition: `height ${uiCtx.animationDuration}ms, width ${uiCtx.animationDuration}ms, padding ${uiCtx.animationDuration}ms`,
                }}
                onContextMenuCapture={showContextMenu((close) => (
                    <DirectoryListItemContextMenu
                        onClose={close}
                        moduleHeader={props.directoryListItem}
                        parentId={props.directoryListItem.id}
                        parentName={props.directoryListItem.name}
                        allowAddItem={props.directoryListItem.type === TrzModuleType.Directory}
                    />
                ))}
            >
                <Button
                    display={'flex'}
                    px={0}
                    variant={selected ? 'light' : 'subtle'}
                    onClick={handleClick}
                    fullWidth
                >
                    <DirectoryListItemIcon
                        moduleType={props.directoryListItem.type}
                        collapsed={!!collapsed}
                        subItemsCount={contents?.length}
                    />
                    <Text
                        c="#fff"
                        style={{
                            transition: `padding ${uiCtx.animationDuration}ms, width ${uiCtx.animationDuration}ms`,
                            textWrap: 'nowrap',
                            textAlign: 'left',
                            width: props.sidebarCollapsed ? '0px' : '100%',
                            paddingLeft: props.sidebarCollapsed ? '0px' : '5px',
                        }}
                    >
                        {props.directoryListItem.name}
                    </Text>
                </Button>
            </Group>

            {contents?.map((subItem) => {
                if (subItem.type !== TrzModuleType.Directory && !subItem.canAccess) {
                    return null;
                }
                return (
                    <DirectoryTreeItem
                        key={subItem.id}
                        sidebarCollapsed={props.sidebarCollapsed || !!collapsed}
                        directoryListItem={subItem}
                        indent={props.indent + 1}
                        visible={!collapsed}
                    />
                );
            })}
        </>
    );
};
