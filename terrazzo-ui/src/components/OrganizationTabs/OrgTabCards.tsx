import { Box, Stack, Title } from '@mantine/core';
import { Organization } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { useNavigate } from 'react-router';
import { DirectoryContentsRows } from '../Directory/DirectoryRows';

interface OrgTabCardsProps {
    orgData: Organization;
}
export const OrgTabCards = (props: OrgTabCardsProps) => {
    const orgData = props.orgData;
    const navigate = useNavigate();
    const sockCtx = useSocket();

    return (
        <Box
            style={{
                width: '80%',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            }}
        >
            <Title
                c="white"
                pb="20"
                order={4}
                maw="200"
            >
                Projects
            </Title>
            {/* // Saved for when we do starred modules */}
            {/* <Box
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Box
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(auto-fill, ${BOARD_CARD_WIDTH + 10}px)`,
                        maxWidth: '100%',
                    }}
                >
                    {nonArchivedBoards.map((board) => (
                        <BoardListCard
                            key={board.id}
                            bgColor={'#121314'}
                            color="white"
                            title={board.name}
                            onClick={() => onClickBoard(board.id)}
                        />
                    ))}
                    <BoardListCard
                        centered
                        title="+ Add Board"
                        bgColor={'#121314'}
                        color="white"
                        onClick={onCreateBoard}
                    />
                </Box>
            </Box> */}
            <Stack w="100%">
                <DirectoryContentsRows
                    modules={orgData.modules}
                    parentId={orgData.id}
                    allowAddItem
                />
            </Stack>
        </Box>
    );
};
