import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { Board, BoardMember } from '@mosaiq/terrazzo-common/dist/types';

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

class BoardMemberModel extends Model {}
BoardMemberModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    userId: DataTypes.STRING,
    boardId: DataTypes.STRING,
    role: DataTypes.STRING
}, { sequelize, modelName: 'boardMemberModel' });

sequelize.sync();


export const getBoardById = async (id: string) => {
    return (await BoardModel.findByPk(id))?.toJSON() as Board | null;
}

export const createBoard = async (board: Board) => {
    return await BoardModel.create({
        id: board.id,
        boardCode: board.boardCode,
        name: board.name,
        archived: false
    });
}

export const updateBoard = async (board: Board) => {
    return await BoardModel.update({
        boardCode: board.boardCode,
        name: board.name,
        archived: board.archived
    }, { where: { id: board.id } });
};

export const setBoardArchived = async (id: string, archived: boolean) => {
    return await BoardModel.update({ archived }, { where: { id } });
};

export const getBoardMembers = async (boardId: string) => {
    return (await BoardMemberModel.findAll({ where: { boardId } })).map(member => member.toJSON()) as BoardMember[];
}

export const addBoardMember = async (userId: string, boardId: string, role: string) => {
    return await BoardMemberModel.create({
        id: `${userId}-${boardId}`,
        userId,
        boardId,
        role
    });
}

export const removeBoardMember = async (userId: string, boardId: string) => {
    return await BoardMemberModel.destroy({ where: { userId, boardId } });
}

export const setBoardMemberRole = async (userId: string, boardId: string, role: string) => {
    return await BoardMemberModel.update({ role }, { where: { userId, boardId } });
}

export const getBoardMember = async (userId: string, boardId: string) => {
    return (await BoardMemberModel.findOne({ where: { userId, boardId } }))?.toJSON() as BoardMember | null;
}