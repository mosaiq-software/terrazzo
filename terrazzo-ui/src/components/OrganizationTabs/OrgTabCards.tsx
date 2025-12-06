import { Box, Title } from '@mantine/core';
import { OrganizationHeader } from '@mosaiq/terrazzo-common/types';

interface OrgTabCardsProps {
    orgData: OrganizationHeader;
}
export const OrgTabCards = (props: OrgTabCardsProps) => {
    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                width: '100%',
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
        </Box>
    );
};
