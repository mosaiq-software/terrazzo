import { Box, Center, Stack, Title, Text } from '@mantine/core';
import React from 'react';
import { NavLink } from 'react-router-dom';

export enum PageErrors {
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    ERROR = 500,
}
interface NotFoundProps {
    itemType: string;
    error: PageErrors;
}
export const NotFound = (props: NotFoundProps) => {
    switch (props.error) {
        case PageErrors.UNAUTHORIZED:
            return (
                <Center py="lg">
                    <Stack>
                        <Title
                            order={1}
                            c="white"
                            ta="center"
                        >
                            401
                        </Title>
                        <Title
                            order={3}
                            c="white"
                            ta="center"
                        >
                            You must be logged in to see this {props.itemType}
                        </Title>
                        <NavLink to="/">
                            <Text c="#9cdcfe">&lt; Back</Text>
                        </NavLink>
                    </Stack>
                </Center>
            );
        case PageErrors.FORBIDDEN:
            return (
                <Center py="lg">
                    <Stack>
                        <Title
                            order={1}
                            c="white"
                            ta="center"
                        >
                            403
                        </Title>
                        <Title
                            order={3}
                            c="white"
                            ta="center"
                        >
                            You don&apos;t have access to this {props.itemType}
                        </Title>
                        <NavLink to="/dashboard">
                            <Text c="#9cdcfe">&lt; Back to Dashboard</Text>
                        </NavLink>
                    </Stack>
                </Center>
            );
        case PageErrors.NOT_FOUND:
            return (
                <Center py="lg">
                    <Stack>
                        <Title
                            order={1}
                            c="white"
                            ta="center"
                        >
                            404
                        </Title>
                        <Title
                            order={3}
                            c="white"
                            ta="center"
                        >
                            This {props.itemType} can&apos;t be found
                        </Title>
                        <NavLink to="/dashboard">
                            <Text c="#9cdcfe">&lt; Back to Dashboard</Text>
                        </NavLink>
                    </Stack>
                </Center>
            );
        default:
            return (
                <Center py="lg">
                    <Stack>
                        <Title
                            order={1}
                            c="white"
                            ta="center"
                        >
                            500
                        </Title>
                        <Title
                            order={3}
                            c="white"
                            ta="center"
                        >
                            There was an error!
                        </Title>
                        <NavLink to="/">
                            <Text c="#9cdcfe">&lt; Back</Text>
                        </NavLink>
                    </Stack>
                </Center>
            );
    }
};
