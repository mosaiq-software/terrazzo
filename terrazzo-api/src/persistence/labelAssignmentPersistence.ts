import { CardId, LabelId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

interface LabelAssignment {
    labelId: LabelId;
    cardId: CardId;
}
class LabelAssignmentModel extends Model<LabelAssignment> {}
LabelAssignmentModel.init(
    {
        labelId: { type: DataTypes.STRING, primaryKey: true },
        cardId: { type: DataTypes.STRING, primaryKey: true },
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'LabelAssignments',
    }
);

export const getLabelsOnCardDb = async (cardId: CardId) => {
    const models = await LabelAssignmentModel.findAll({ where: { cardId } });
    return models.map((label) => label.toJSON().labelId);
};

export const deleteLabelingOnCardsByLabelIdDb = async (labelId: LabelId) => {
    const deleted = await LabelAssignmentModel.destroy({ where: { labelId } });
    return deleted;
};

export const setLabelsOnCardDb = async (cardId: CardId, labelIds: LabelId[]) => {
    const transaction = await sequelize.transaction();
    try {
        await LabelAssignmentModel.destroy({ where: { cardId }, transaction });
        for (const labelId of labelIds) {
            await LabelAssignmentModel.create({ labelId, cardId }, { transaction });
        }
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
