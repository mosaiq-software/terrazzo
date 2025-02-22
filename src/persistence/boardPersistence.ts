import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { Board, BoardId } from '@mosaiq/terrazzo-common/types';

class BoardModel extends Model {}
BoardModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    boardCode: DataTypes.STRING,
    name: DataTypes.STRING,
    archived: DataTypes.BOOLEAN,
    createdAt: DataTypes.INTEGER,
    totalCards: DataTypes.INTEGER,
}, { sequelize, modelName: 'boardModel' });

sequelize.sync();

export const getBoards = async () => {
    return (await BoardModel.findAll()).map(board => board.toJSON()) as Board[];
}

export const getBoardById = async (id: BoardId) => {
    return (await BoardModel.findByPk(id, {
        attributes:{
            exclude:['createdAt', 'updatedAt']
        }}))?.toJSON() as Board | undefined;
}

export const createBoard = async (board: Board) => {
    return await BoardModel.create({
        id: board.id,
        boardCode: board.boardCode,
        name: board.name,
        archived: false,
        totalCards: board.totalCards,
    });
}

export const updateBoard = async (board: Board) => {
    return await BoardModel.update({
        boardCode: board.boardCode,
        name: board.name,
        archived: board.archived,
        totalCards: board.totalCards
    }, { where: { id: board.id } });
};

export const setBoardArchived = async (id: BoardId, archived: boolean) => {
    return await BoardModel.update({ archived }, { where: { id } });
};