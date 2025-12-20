import { Button, Container, Group, Space, Stack, Text, Title } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { useUserContext } from '@trz/contexts/user-context';
import { getGithubLoginUrl } from '@trz/util/authUtils';
import React from 'react';
import { MdCheck } from 'react-icons/md';
import { Link } from 'react-router';

const GITHUB_LOGOUT_URL = 'https://github.com/logout';

const LinkGithubAccount = (props: ContextModalProps<{}>): React.JSX.Element => {
    const userCtx = useUserContext();
    const [hasLoggedOut, setHasLoggedOut] = React.useState(false);

    const handleClose = () => {
        props.context.closeModal(props.id);
    };

    const handleLogoutAndContinue = () => {
        setHasLoggedOut(true);
        window.open(GITHUB_LOGOUT_URL, '_blank');
    };

    return (
        <Container onKeyDown={getHotkeyHandler([['Escape', handleClose]])}>
            <Title
                order={3}
                mb="md"
            >
                Link Github Account
            </Title>
            <Stack>
                <Text>First, click to log out of your current Github accounts.</Text>
                <Button
                    onClick={handleLogoutAndContinue}
                    variant={hasLoggedOut ? 'outline' : 'filled'}
                    leftSection={hasLoggedOut ? <MdCheck /> : undefined}
                    color={hasLoggedOut ? 'green' : undefined}
                >
                    Log out of Github
                </Button>
                <Space h="md" />
                <Text>Next, click to link a Github account to your Terrazzo account.</Text>
                <Button
                    component={Link}
                    to={getGithubLoginUrl()}
                    disabled={!hasLoggedOut}
                >
                    Link Github Account
                </Button>
                <Space h="md" />
                <Text>
                    Once linked, you should see the Github account appear in your <Link to="/settings">User Settings</Link> page.
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
