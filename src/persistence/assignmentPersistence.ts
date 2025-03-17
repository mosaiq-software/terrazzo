import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { Assignment, AssignmentId, BoardId, CardId, Label, LabelId, UserId } from '@mosaiq/terrazzo-common/types';

class AssignmentModel extends Model {}
AssignmentModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    userId: DataTypes.STRING,
    cardId: DataTypes.STRING,
}, { sequelize, modelName: 'assignmentModel' });

sequelize.sync();

export const getAssignmentById = async (asnId: AssignmentId) => {
    return (await AssignmentModel.findByPk(asnId))?.toJSON() as Assignment | null;
}

export const getAssignmentsForUser = async (userId: UserId): Promise<CardId[]> => {
    return (await AssignmentModel.findAll({ where: { userId } })).map(asn => (asn.toJSON() as Assignment).cardId);
}

export const getAssignmentsForCard = async (cardId: CardId): Promise<UserId[]> => {
    return (await AssignmentModel.findAll({ where: { cardId } })).map(asn => (asn.toJSON() as Assignment).userId);
}

export const getAssignmentRecordsForUserOnCard = async (userId:UserId, cardId: CardId): Promise<Assignment[]> => {
    return (await AssignmentModel.findAll({ where: { cardId, userId } })).map(asn => (asn.toJSON() as Assignment));
}


export const createAssignmentRecord = async (userId: UserId, cardId:CardId) => {
    return await AssignmentModel.create({
        id: crypto.randomUUID(),
        userId, cardId
    });
}

export const deleteAssignmentRecord = async (asnId: AssignmentId) => {
    return await AssignmentModel.destroy({ where: { id:asnId } });
}