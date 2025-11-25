import { Flex } from '@mantine/core';

interface ContextMenuLayoutProps {
    children: React.ReactNode;
}
export const ContextMenuLayout = (props: ContextMenuLayoutProps) => {
    return (
        <Flex
            direction={'column'}
            gap="0"
            justify="start"
            style={{
                overflow: 'visible',
            }}
        >
            {props.children}
        </Flex>
    );
};
