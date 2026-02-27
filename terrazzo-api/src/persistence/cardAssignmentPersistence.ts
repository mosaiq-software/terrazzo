import { CardId, UserId } from '@mosaiq/terrazzo-common';
import { CardAssignmentModel } from '@mosaiq/terrazzo-db';
import { Op } from 'sequelize';

export const getCardAssignmentsForUserDb = async (userId: UserId): Promise<CardId[]> => {
    const models = await CardAssignmentModel.findAll({ attributes: ['cardId'], where: { userId } });
    return models.map((asn) => asn.toJSON().cardId);
};

export const getCardAssignmentsForCardDb = async (cardId: CardId): Promise<UserId[]> => {
    const models = await CardAssignmentModel.findAll({ attributes: ['userId'], where: { cardId } });
    return models.map((asn) => asn.toJSON().userId);
};

export const cardAssignmentExistsDb = async (userId: UserId, cardId: CardId): Promise<boolean> => {
    const model = await CardAssignmentModel.findOne({ where: { userId, cardId } });
    return model !== null;
};

export const createCardAssignmentRecordDb = async (userId: UserId, cardId: CardId) => {
    const model = await CardAssignmentModel.create({ userId, cardId });
    return model.toJSON();
};

export const deleteCardAssignmentRecordDb = async (userId: UserId, cardId: CardId) => {
    const deleted = await CardAssignmentModel.destroy({ where: { userId, cardId } });
    return deleted;
};

export const addCardAssignmentsForUserDb = async (userId: UserId, cardIds: CardId[]): Promise<void> => {
    const existing = await getCardAssignmentsForUserDb(userId);
    const existingSet = new Set<CardId>(existing);
    const toAdd = cardIds.filter((id) => !existingSet.has(id));
    await CardAssignmentModel.bulkCreate(toAdd.map((cardId) => ({ userId, cardId })));
};

export const removeCardAssignmentsForUserDb = async (userId: UserId, cardIds: CardId[]): Promise<void> => {
    await CardAssignmentModel.destroy({ where: { userId, cardId: { [Op.in]: cardIds } } });
};
