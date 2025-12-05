import { AssignmentId, CardAssignment, CardId, UserId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class CardAssignmentModel extends Model<CardAssignment> {}
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
    const model = await CardAssignmentModel.findByPk(asnId);
    return model?.toJSON();
};

export const getCardAssignmentsForUser = async (userId: UserId): Promise<CardId[]> => {
    const models = await CardAssignmentModel.findAll({ where: { userId } });
    return models.map((asn) => asn.toJSON().cardId);
};

export const getCardAssignmentsForCard = async (cardId: CardId): Promise<UserId[]> => {
    const models = await CardAssignmentModel.findAll({ where: { cardId } });
    return models.map((asn) => asn.toJSON().userId);
};

export const getCardAssignmentRecordsForUserOnCard = async (userId: UserId, cardId: CardId): Promise<CardAssignment[]> => {
    const models = await CardAssignmentModel.findAll({ where: { cardId, userId } });
    return models.map((asn) => asn.toJSON());
};

export const createCardAssignmentRecord = async (userId: UserId, cardId: CardId) => {
    const model = await CardAssignmentModel.create({
        id: crypto.randomUUID(),
        userId,
        cardId,
    });
    return model.toJSON();
};

export const deleteCardAssignmentRecord = async (asnId: AssignmentId) => {
    const deleted = await CardAssignmentModel.destroy({ where: { id: asnId } });
    return deleted;
};
