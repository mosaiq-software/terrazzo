import { BoardId } from '@mosaiq/terrazzo-common';
import { BoardModel, BoardModelType, CacheEntity, getCached, invalidateCache } from '@mosaiq/terrazzo-db';

export const getBoardsDb = async () => {
    const models = await BoardModel.findAll();
    return models.map((board) => board.toJSON());
};

export const getBoardByIdDb = async (id: BoardId) => {
    return await getCached(CacheEntity.Board, id, async () => {
        const model = await BoardModel.findByPk(id);
        return model?.toJSON();
    });
};

export const createBoardDb = async (board: BoardModelType) => {
    const model = await BoardModel.create({ ...board });
    return model.toJSON();
};

export const updateBoardDb = async (boardID: BoardId, board: Partial<BoardModelType>) => {
    const [updated] = await BoardModel.update({ ...board }, { where: { id: boardID } });
    await invalidateCache(CacheEntity.Board, boardID);
    return updated;
};
