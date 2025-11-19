import { Stack } from '@mantine/core';
import { DirectoryList } from '@mosaiq/terrazzo-common/types';
import { DirectoryTreeItem } from './DirectoryTreeItem';

interface DirectoryTreeProps {
    sidebarCollapsed: boolean;
    directoryList: DirectoryList;
}
export const DirectoryTree = (props: DirectoryTreeProps) => {
    return (
        <Stack
            gap={0}
            p={0}
        >
            {props.directoryList.map((item) => (
                <DirectoryTreeItem
                    key={item.moduleId}
                    sidebarCollapsed={props.sidebarCollapsed}
                    directoryListItem={item}
                    indent={0}
                />
            ))}
        </Stack>
    );
};
