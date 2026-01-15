import { Center, Loader } from '@mantine/core';

export const FullLoader = () => {
    return (
        <Center style={{ width: '100%', height: '100%' }}>
            <Loader />
        </Center>
    );
};
