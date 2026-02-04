import { AssignmentId, CardAssignment, CardId, UserId } from '@mosaiq/terrazzo-common';
import { CardAssignmentModel } from '@mosaiq/terrazzo-db';

export const getCardAssignmentByIdDb = async (asnId: AssignmentId) => {
    const model = await CardAssignmentModel.findByPk(asnId);
    return model?.toJSON();
};

export const getCardAssignmentsForUserDb = async (userId: UserId): Promise<CardId[]> => {
    const models = await CardAssignmentModel.findAll({ where: { userId } });
    return models.map((asn) => asn.toJSON().cardId);
};

export const getCardAssignmentsForCardDb = async (cardId: CardId): Promise<UserId[]> => {
    const models = await CardAssignmentModel.findAll({ where: { cardId } });
    return models.map((asn) => asn.toJSON().userId);
};

export const getCardAssignmentRecordsForUserOnCardDb = async (
    userId: UserId,
    cardId: CardId
): Promise<CardAssignment[]> => {
    const models = await CardAssignmentModel.findAll({ where: { cardId, userId } });
    return models.map((asn) => asn.toJSON());
};

export const createCardAssignmentRecordDb = async (userId: UserId, cardId: CardId) => {
    const model = await CardAssignmentModel.create({
        id: crypto.randomUUID(),
        userId,
        cardId,
    });
    return model.toJSON();
};

export const deleteCardAssignmentRecordDb = async (asnId: AssignmentId) => {
    const deleted = await CardAssignmentModel.destroy({ where: { id: asnId } });
    return deleted;
};
