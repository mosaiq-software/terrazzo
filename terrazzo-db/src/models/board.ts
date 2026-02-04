import { BoardId } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export interface BoardModelType {
    id: BoardId;
    boardCode: string;
}

export const BoardModel = (sequelize: Sequelize): DbModel => {
    class BoardModel extends Model<BoardModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
    BoardModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            boardCode: DataTypes.STRING,
        },
        { sequelize, timestamps: false, modelName: 'Board' }
    );

    return BoardModel;
};
