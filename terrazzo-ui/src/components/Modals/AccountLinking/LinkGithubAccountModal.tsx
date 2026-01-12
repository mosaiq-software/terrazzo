import { Button, Container, Group, Space, Stack, Text, Title } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { useUserContext } from '@trz/contexts/user-context';
import { getGithubLoginUrl } from '@trz/util/authUtils';
import { COLORS } from '@trz/util/colors';
import React, { useCallback } from 'react';
import { MdCheck } from 'react-icons/md';
import { Link } from 'react-router';

const GITHUB_LOGOUT_URL = 'https://github.com/logout';

const LinkGithubAccount = (props: ContextModalProps<{}>): React.JSX.Element => {
    const userCtx = useUserContext();
    const [hasLoggedOut, setHasLoggedOut] = React.useState(false);

    const handleClose = useCallback(() => {
        props.context.closeModal(props.id);
    }, [props.context, props.id]);

    const handleLogoutAndContinue = useCallback(() => {
        setHasLoggedOut(true);
        window.open(GITHUB_LOGOUT_URL, '_blank');
    }, []);

    const handleClickLinkGithub = useCallback(() => {
        userCtx.saveCurrentRouteForPostLogin();
        window.open(getGithubLoginUrl(), '_self');
    }, [userCtx]);

    return (
        <Container onKeyDown={getHotkeyHandler([['Escape', handleClose]])}>
            <Title
                order={3}
                mb="md"
            >
                Link Github Account
            </Title>
            <Stack>
                <Text>
                    {' '}
                    <Text
                        span
                        fw={700}
                        fz="lg"
                    >
                        1.{' '}
                    </Text>
                    Click "Log out of Github" and log out of all GitHub accounts.
                </Text>
                <Button
                    onClick={handleLogoutAndContinue}
                    variant={hasLoggedOut ? 'outline' : 'filled'}
                    leftSection={hasLoggedOut ? <MdCheck /> : undefined}
                    color={hasLoggedOut ? COLORS.semantic.success : undefined}
                >
                    Log out of Github
                </Button>
                <Space h="md" />
                <Text>
                    <Text
                        span
                        fw={700}
                        fz="lg"
                    >
                        2.{' '}
                    </Text>
                    Return to this page, click "Link Github Account", and sign in with the GitHub account you want to
                    link.
                </Text>
                <Button
                    disabled={!hasLoggedOut}
                    onClick={handleClickLinkGithub}
                >
                    Link Github Account
                </Button>
                <Space h="md" />
                <Text>
                    Once linked, you should see the Github account appear in your{' '}
                    <Link to="/settings">User Settings</Link> page.
                </Text>
                <Space h="md" />
            </Stack>
            <Group>
                <Button
                    variant="default"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
            </Group>
        </Container>
    );
};

export const LinkGithubAccountModal = (props: ContextModalProps<{}>) => <LinkGithubAccount {...props} />;
