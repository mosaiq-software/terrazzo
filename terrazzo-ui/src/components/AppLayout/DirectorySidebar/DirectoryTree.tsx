import { Stack } from '@mantine/core';
import { ModuleHeaderWithChildren } from '@mosaiq/terrazzo-common/types';
import { DirectoryTreeItem } from './DirectoryTreeItem';

interface DirectoryTreeProps {
    sidebarCollapsed: boolean;
    directoryTreeRoot: ModuleHeaderWithChildren;
}
export const DirectoryTree = (props: DirectoryTreeProps) => {
    return (
        <Stack
            gap={0}
            p={0}
        >
            {props.directoryTreeRoot.children?.map((item) => (
                <DirectoryTreeItem
                    key={item.id}
                    sidebarCollapsed={props.sidebarCollapsed}
                    directoryListItem={item}
                    indent={0}
                />
            ))}
        </Stack>
    );
};
