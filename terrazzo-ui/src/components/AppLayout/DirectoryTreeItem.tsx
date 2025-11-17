import { Button, Group, Text } from '@mantine/core';
import { DirectoryListItem, TrzModuleType } from '@mosaiq/terrazzo-common/types';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { MdFolder } from 'react-icons/md';
import { useNavigate } from 'react-router';

interface DirectoryTreeItemProps {
    sidebarCollapsed: boolean;
    directoryListItem: DirectoryListItem;
    indent: number;
}
export const DirectoryTreeItem = (props: DirectoryTreeItemProps) => {
    const trz = useTRZ();
    const navigate = useNavigate();

    const selected = window.location.pathname.includes(props.directoryListItem.moduleId);
    const handleClick = () => {
        const url = getModuleUrl(props.directoryListItem.moduleType, props.directoryListItem.moduleId);
        navigate(url);
    };

    return (
        <>
            <Group
                align="center"
                justify="flex-start"
                p="0"
                pl={`${props.indent * 20}px`}
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
                    <DirectoryListItemIcon moduleType={props.directoryListItem.moduleType} />
                    <Text
                        c="#fff"
                        style={{
                            transition: `padding ${trz.animationDuration}ms, width ${trz.animationDuration}ms`,
                            textWrap: 'nowrap',
                            textAlign: 'left',
                            width: props.sidebarCollapsed ? '0px' : '200px',
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
                        sidebarCollapsed={props.sidebarCollapsed}
                        directoryListItem={subItem}
                        indent={props.indent + 1}
                    />
                ))}
        </>
    );
};

interface DirectoryListItemIconProps {
    moduleType: TrzModuleType;
}
const DirectoryListItemIcon = (props: DirectoryListItemIconProps) => {
    switch (props.moduleType) {
        case TrzModuleType.Directory:
            return <MdFolder />;
        case TrzModuleType.Document:
            return <></>;
        case TrzModuleType.Board:
            return <></>;
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
