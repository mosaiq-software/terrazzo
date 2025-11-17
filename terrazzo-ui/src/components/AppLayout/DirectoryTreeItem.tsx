import { Button, Group, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { DirectoryListItem, TrzModuleType } from '@mosaiq/terrazzo-common/types';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { FaChevronDown } from 'react-icons/fa';
import { IoDocumentOutline } from 'react-icons/io5';
import { MdOutlineViewKanban } from 'react-icons/md';
import { useNavigate } from 'react-router';

interface DirectoryTreeItemProps {
    sidebarCollapsed: boolean;
    directoryListItem: DirectoryListItem;
    indent: number;
}
export const DirectoryTreeItem = (props: DirectoryTreeItemProps) => {
    const trz = useTRZ();
    const navigate = useNavigate();
    const [collapsed, setCollapsed, deleteCollapsed] = useLocalStorage<boolean | undefined>({ key: `directory-tree-item-collapsed-${props.directoryListItem.moduleId}`, defaultValue: undefined });

    const selected = window.location.pathname.includes(props.directoryListItem.moduleId);
    const handleClick = () => {
        if (props.directoryListItem.moduleType === TrzModuleType.Directory) {
            if (collapsed) {
                deleteCollapsed();
            } else {
                setCollapsed(true);
            }
            return;
        }

        const url = getModuleUrl(props.directoryListItem.moduleType, props.directoryListItem.moduleId);
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
            >
                <Button
                    display={'flex'}
                    px={0}
                    variant={selected ? 'light' : 'subtle'}
                    onClick={handleClick}
                >
                    <DirectoryListItemIcon
                        moduleType={props.directoryListItem.moduleType}
                        collapsed={!!collapsed}
                        subItemsCount={props.directoryListItem.moduleType === TrzModuleType.Directory ? props.directoryListItem.subItems.length : 0}
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
                        {props.directoryListItem.moduleName}
                    </Text>
                </Button>
            </Group>

            {props.directoryListItem.moduleType === TrzModuleType.Directory &&
                props.directoryListItem.subItems.map((subItem) => (
                    <DirectoryTreeItem
                        key={subItem.moduleId}
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
        case TrzModuleType.Directory:
            return `/dir/${moduleId}`;
        case TrzModuleType.Document:
            return `/doc/${moduleId}`;
        case TrzModuleType.Board:
            return `/board/${moduleId}`;
        default:
            return '/';
    }
};
