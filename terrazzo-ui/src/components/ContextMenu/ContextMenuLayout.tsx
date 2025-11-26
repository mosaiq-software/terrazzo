import { ButtonGroup, Flex, Text } from '@mantine/core';

interface ContextMenuLayoutProps {
    children: React.ReactNode;
    title?: string;
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
            {props.title && (
                <Text
                    w="100%"
                    ta="center"
                    fz="xs"
                    py="xs"
                >
                    {props.title}
                </Text>
            )}
            <ButtonGroup orientation="vertical">{props.children}</ButtonGroup>
        </Flex>
    );
};
