import { BoardId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

export interface BoardModelType {
    id: BoardId;
    boardCode: string;
    totalCards: number;
}
class BoardModel extends Model {}
BoardModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        boardCode: DataTypes.STRING,
        totalCards: DataTypes.INTEGER,
    },
    { sequelize, timestamps: false }
);

export const getBoards = async () => {
    return (await BoardModel.findAll()).map((board) => board.toJSON()) as BoardModelType[];
};

export const getBoardById = async (id: BoardId) => {
    return (await BoardModel.findByPk(id, {}))?.toJSON() as BoardModelType | undefined;
};

export const createBoard = async (board: BoardModelType) => {
    return await BoardModel.create({ ...board });
};

export const updateBoard = async (boardID: BoardId, board: Partial<BoardModelType>) => {
    return await BoardModel.update({ ...board }, { where: { id: boardID } });
};
