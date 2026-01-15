import { Center, Group, Stack, Text, Title } from '@mantine/core';
import { MdArrowBack } from 'react-icons/md';
import { NavLink } from 'react-router-dom';
import { COLORS } from '../../util/colors';

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

interface ErrorPageConfig {
    code: number;
    message: string;
    linkTo: string;
    linkText: string;
}

const ErrorPage = ({ code, message, linkTo, linkText }: ErrorPageConfig) => (
    <Center py="lg">
        <Stack
            align="center"
            gap="md"
        >
            <Title
                order={1}
                c={COLORS.text.primary}
                ta="center"
                fz={96}
            >
                {code}
            </Title>
            <Title
                order={3}
                c={COLORS.text.primary}
                ta="center"
            >
                {message}
            </Title>
            <NavLink
                to={linkTo}
                style={{ textDecoration: 'none' }}
            >
                <Group
                    gap={2}
                    wrap="nowrap"
                >
                    <MdArrowBack color={COLORS.semantic.info} />
                    <Text c={COLORS.semantic.info}>{linkText}</Text>
                </Group>
            </NavLink>
        </Stack>
    </Center>
);

export const NotFound = ({ itemType, error }: NotFoundProps) => {
    const errorConfigs: Record<PageErrors, ErrorPageConfig> = {
        [PageErrors.UNAUTHORIZED]: {
            code: 401,
            message: `You must be logged in to see this ${itemType}`,
            linkTo: '/',
            linkText: 'Back',
        },
        [PageErrors.FORBIDDEN]: {
            code: 403,
            message: `You don't have access to this ${itemType}`,
            linkTo: '/dashboard',
            linkText: 'Back to Dashboard',
        },
        [PageErrors.NOT_FOUND]: {
            code: 404,
            message: `This ${itemType} can't be found`,
            linkTo: '/dashboard',
            linkText: 'Back to Dashboard',
        },
        [PageErrors.ERROR]: {
            code: 500,
            message: 'There was an error!',
            linkTo: '/',
            linkText: 'Back',
        },
    };

    const config = errorConfigs[error] || errorConfigs[PageErrors.ERROR];
    return <ErrorPage {...config} />;
};
