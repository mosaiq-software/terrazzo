import { BoardId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

export interface BoardModelType {
    id: BoardId;
    boardCode: string;
}
class BoardModel extends Model<BoardModelType> {}
BoardModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        boardCode: DataTypes.STRING,
    },
    { sequelize, timestamps: false, tableName: 'Boards' }
);

export const getBoardsDb = async () => {
    const models = await BoardModel.findAll();
    return models.map((board) => board.toJSON());
};

export const getBoardByIdDb = async (id: BoardId) => {
    const model = await BoardModel.findByPk(id, {});
    return model?.toJSON();
};

export const createBoardDb = async (board: BoardModelType) => {
    const model = await BoardModel.create({ ...board });
    return model.toJSON();
};

export const updateBoardDb = async (boardID: BoardId, board: Partial<BoardModelType>) => {
    const [updated] = await BoardModel.update({ ...board }, { where: { id: boardID } });
    return updated;
};
