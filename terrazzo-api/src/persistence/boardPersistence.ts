import { BoardHeader, BoardId, DirectoryId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class BoardModel extends Model {}
BoardModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        parentId: DataTypes.STRING,
        boardCode: DataTypes.STRING,
        name: DataTypes.STRING,
        archived: DataTypes.BOOLEAN,
        createdAt: DataTypes.INTEGER,
        totalCards: DataTypes.INTEGER,
    },
    { sequelize }
);

export const getBoards = async () => {
    return (await BoardModel.findAll()).map((board) => board.toJSON()) as BoardHeader[];
};

export const getBoardById = async (id: BoardId) => {
    return (
        await BoardModel.findByPk(id, {
            attributes: {
                exclude: ['updatedAt'],
            },
        })
    )?.toJSON() as BoardHeader | undefined;
};

export const getBoardsByParentId = async (parentId: DirectoryId) => {
    return (
        await BoardModel.findAll({
            where: { parentId },
            order: [['createdAt', 'ASC']],
            attributes: {
                exclude: ['updatedAt'],
            },
        })
    ).map((board) => board.toJSON()) as BoardHeader[];
};

export const createBoard = async (board: BoardHeader) => {
    return await BoardModel.create({
        id: board.id,
        parentId: board.parentId,
        boardCode: board.boardCode,
        name: board.name,
        archived: false,
        totalCards: board.totalCards,
    });
};

export const updateBoard = async (board: BoardHeader) => {
    return await BoardModel.update(
        {
            boardCode: board.boardCode,
            name: board.name,
            archived: board.archived,
            totalCards: board.totalCards,
        },
        { where: { id: board.id } }
    );
};
