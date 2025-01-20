import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { Comment } from '@mosaiq/terrazzo-common/dist/types';

class CommentModel extends Model {}
CommentModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    cardId: DataTypes.STRING,
    content: DataTypes.STRING,
    postedBy: DataTypes.STRING,
    postedAt: DataTypes.DATE,
    archived: DataTypes.BOOLEAN
}, { sequelize, modelName: 'commentModel' });

sequelize.sync();

export const getCommentById = async (id: string) => {
    return (await CommentModel.findByPk(id))?.toJSON() as Comment | null;
}

export const getCommentsByCardId = async (cardId: string) => {
    return (await CommentModel.findAll({ where: { cardId } })).map(comment => comment.toJSON()) as Comment[];
}

export const getCommentsByUserId = async (userId: string) => {
    return (await CommentModel.findAll({ where: { postedBy: userId } })).map(comment => comment.toJSON()) as Comment[];
}

export const createCommentOnCard = async (comment: Comment, cardId: string) => {
    return await CommentModel.create({
        id: comment.id,
        cardId,
        content: comment.content,
        postedBy: comment.postedBy,
        postedAt: comment.postedAt,
        archived: false
    });
}

export const updateComment = async (comment: Comment) => {
    return await CommentModel.update({
        content: comment.content,
        archived: comment.archived
    }, { where: { id: comment.id } });
}

export const setCommentArchived = async (id: string, archived: boolean) => {
    return await CommentModel.update({ archived }, { where: { id } });
}

