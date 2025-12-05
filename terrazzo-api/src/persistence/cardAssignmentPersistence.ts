import { AssignmentId, CardAssignment, CardId, UserId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class CardAssignmentModel extends Model {}
CardAssignmentModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        userId: DataTypes.STRING,
        cardId: DataTypes.STRING,
    },
    { sequelize }
);

export const getCardAssignmentById = async (asnId: AssignmentId) => {
    return (await CardAssignmentModel.findByPk(asnId))?.toJSON() as CardAssignment | null;
};

export const getCardAssignmentsForUser = async (userId: UserId): Promise<CardId[]> => {
    return (await CardAssignmentModel.findAll({ where: { userId } })).map((asn) => (asn.toJSON() as CardAssignment).cardId);
};

export const getCardAssignmentsForCard = async (cardId: CardId): Promise<UserId[]> => {
    return (await CardAssignmentModel.findAll({ where: { cardId } })).map((asn) => (asn.toJSON() as CardAssignment).userId);
};

export const getCardAssignmentRecordsForUserOnCard = async (userId: UserId, cardId: CardId): Promise<CardAssignment[]> => {
    return (await CardAssignmentModel.findAll({ where: { cardId, userId } })).map((asn) => asn.toJSON() as CardAssignment);
};

export const createCardAssignmentRecord = async (userId: UserId, cardId: CardId) => {
    return await CardAssignmentModel.create({
        id: crypto.randomUUID(),
        userId,
        cardId,
    });
};

export const deleteCardAssignmentRecord = async (asnId: AssignmentId) => {
    return await CardAssignmentModel.destroy({ where: { id: asnId } });
};
