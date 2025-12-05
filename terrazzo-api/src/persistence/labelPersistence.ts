import { BoardId, CardId, Label, LabelId } from '@mosaiq/terrazzo-common/types';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class LabelModel extends Model<Label> {}
LabelModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        boardId: DataTypes.STRING,
        name: DataTypes.STRING,
        color: DataTypes.STRING,
    },
    { sequelize }
);

interface LabeledCard {
    labelId: LabelId;
    cardId: CardId;
}
class LabeledCardModel extends Model<LabeledCard> {}
LabeledCardModel.init(
    {
        labelId: { type: DataTypes.STRING, primaryKey: true },
        cardId: { type: DataTypes.STRING, primaryKey: true },
    },
    {
        sequelize,
        timestamps: false,
    }
);

export const getLabelById = async (id: LabelId) => {
    const model = await LabelModel.findByPk(id);
    return model?.toJSON();
};

export const getLabelsByBoardId = async (boardId: BoardId) => {
    const models = await LabelModel.findAll({ where: { boardId } });
    return models.map((label) => label.toJSON());
};

export const createLabelOnBoard = async (label: Label, boardId: BoardId) => {
    const model = await LabelModel.create({
        id: label.id,
        boardId,
        name: label.name,
        color: label.color,
    });
    return model.toJSON();
};

export const updateLabel = async (label: Label) => {
    const [updated] = await LabelModel.update(
        {
            name: label.name,
            color: label.color,
        },
        { where: { id: label.id } }
    );
    return updated;
};

export const deleteLabel = async (id: LabelId) => {
    const deleted = await LabelModel.destroy({ where: { id } });
    return deleted;
};

export const deleteLabelsByBoardId = async (boardId: BoardId) => {
    const deleted = await LabelModel.destroy({ where: { boardId } });
    return deleted;
};

export const getLabelsOnCard = async (cardId: CardId) => {
    const models = await LabeledCardModel.findAll({ where: { cardId } });
    return models.map((label) => label.toJSON().labelId);
};

export const deleteLabelingOnCardsByLabelId = async (labelId: LabelId) => {
    const deleted = await LabeledCardModel.destroy({ where: { labelId } });
    return deleted;
};

export const deleteLabelsOnCard = async (cardId: CardId) => {
    const deleted = await LabeledCardModel.destroy({ where: { cardId } });
    return deleted;
};

export const addLabelToCard = async (labelId: LabelId, cardId: CardId) => {
    const model = await LabeledCardModel.create({
        labelId,
        cardId,
    });
    return model.toJSON();
};
