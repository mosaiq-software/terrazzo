import { Button, Group, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { ModuleHeaderWithChildren, TrzModuleType } from '@mosaiq/terrazzo-common/types';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { useContextMenu } from 'mantine-contextmenu';
import { FaChevronDown } from 'react-icons/fa';
import { IoDocumentOutline } from 'react-icons/io5';
import { MdOutlineViewKanban } from 'react-icons/md';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { DirectoryListItemContextMenu } from './DirectoryListItemContextMenu';

interface DirectoryTreeItemProps {
    sidebarCollapsed: boolean;
    directoryListItem: ModuleHeaderWithChildren;
    indent: number;
}
export const DirectoryTreeItem = (props: DirectoryTreeItemProps) => {
    const trz = useTRZ();
    const navigate = useNavigate();
    const location = useLocation();
    const { showContextMenu } = useContextMenu();

    const [collapsed, setCollapsed, deleteCollapsed] = useLocalStorage<boolean | undefined>({ key: `directory-tree-item-collapsed-${props.directoryListItem.id}`, defaultValue: undefined });

    const selected = location.pathname.includes(props.directoryListItem.id);

    const handleClick = () => {
        if (props.directoryListItem.type === TrzModuleType.Directory) {
            if (collapsed) {
                deleteCollapsed();
            } else {
                setCollapsed(true);
            }
            return;
        }

        const url = getModuleUrl(props.directoryListItem.type, props.directoryListItem.id);
        navigate(url);
    };

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
                    transition: `height ${trz.animationDuration}ms, width ${trz.animationDuration}ms, padding ${trz.animationDuration}ms`,
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
                        subItemsCount={(props.directoryListItem.type === TrzModuleType.Directory ? props.directoryListItem.children?.length : 0) ?? 0}
                    />
                    <Text
                        c="#fff"
                        style={{
                            transition: `padding ${trz.animationDuration}ms, width ${trz.animationDuration}ms`,
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

            {props.directoryListItem.type === TrzModuleType.Directory &&
                props.directoryListItem.children?.map((subItem) => (
                    <DirectoryTreeItem
                        key={subItem.id}
                        sidebarCollapsed={props.sidebarCollapsed || !!collapsed}
                        directoryListItem={subItem}
                        indent={props.indent + 1}
                    />
                ))}
        </>
    );
};

interface DirectoryListItemIconProps {
    moduleType: TrzModuleType;
    collapsed?: boolean;
    subItemsCount?: number;
}
const DirectoryListItemIcon = (props: DirectoryListItemIconProps) => {
    switch (props.moduleType) {
        case TrzModuleType.Directory:
            if (!props.subItemsCount) {
                return <></>;
            }
            return (
                <FaChevronDown
                    color="white"
                    style={{
                        transform: props.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms',
                    }}
                />
            );
        case TrzModuleType.Document:
            return <IoDocumentOutline color="white" />;
        case TrzModuleType.Board:
            return <MdOutlineViewKanban color="white" />;
        default:
            return <></>;
    }
};

const getModuleUrl = (moduleType: TrzModuleType, moduleId: string): string => {
    switch (moduleType) {
        case TrzModuleType.Document:
            return `/doc/${moduleId}`;
        case TrzModuleType.Board:
            return `/board/${moduleId}`;
        default:
            return '/';
    }
};
