import { Center, Container, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { useUser } from '@trz/contexts/user-context';
import { NoteType, notify } from '@trz/util/notifications';
import queryString from 'query-string';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/*
This page will only show as the callback fro github login. It should take the code from the string, save it, and then go to another page with the new data.
*/
export const GithubAuth = () => {
    const usr = useUser();
    const navigate = useNavigate();
    const urlParams = queryString.parse(window.location.search);
    const code = urlParams.code;

    useEffect(() => {
        let strictIgnore = false;
        const fetchData = async (code: any) => {
            await new Promise((res) => setTimeout(res, 50));
            if (strictIgnore) {
                return;
            }
            if (!code || typeof code !== 'string') {
                notify(NoteType.GITHUB_AUTH_ERROR, 'Invalid github code!');
                navigate('/');
                return;
            }
            await usr.githubLogin(code);
        };
        fetchData(code);
        return () => {
            strictIgnore = true;
        };
    }, [code]);

    return (
        <Container
            h="100%"
            fluid
            maw="100%"
            p="lg"
            bg="#1d2022"
        >
            <Center>
                <Paper bg={'#0c0c10'}>
                    <Stack
                        px={50}
                        py={30}
                        mih={400}
                        ta="center"
                        c={'#ebebeb'}
                        align="center"
                    >
                        <Title>Working on it...</Title>
                        <Text>Hold tight, we&apos;re logging you in with Github.</Text>
                        <Loader
                            type="bars"
                            size="xl"
                        />
                    </Stack>
                </Paper>
            </Center>
        </Container>
    );
};
