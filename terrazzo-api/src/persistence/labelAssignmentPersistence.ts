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

export const deleteLabelsOnCardDb = async (cardId: CardId) => {
    const deleted = await LabelAssignmentModel.destroy({ where: { cardId } });
    return deleted;
};

export const addLabelToCardDb = async (labelId: LabelId, cardId: CardId) => {
    const model = await LabelAssignmentModel.create({
        labelId,
        cardId,
    });
    return model.toJSON();
};
