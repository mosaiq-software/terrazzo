import { CardId, LabelId } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export interface LabelAssignment {
    labelId: LabelId;
    cardId: CardId;
}

export const getLabelAssignmentModel = (sequelize: Sequelize): DbModel<LabelAssignment> => {
    class LabelAssignmentModel extends Model<LabelAssignment> {
        static associate(db: Db) {
            // define association here
        }
    }
    LabelAssignmentModel.init(
        {
            labelId: { type: DataTypes.STRING, primaryKey: true },
            cardId: { type: DataTypes.STRING, primaryKey: true },
        },
        { sequelize, timestamps: false, modelName: 'LabelAssignment' }
    );

    return LabelAssignmentModel;
};
