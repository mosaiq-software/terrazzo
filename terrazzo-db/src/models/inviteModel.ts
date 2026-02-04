import { Invite } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const getInviteModel = (sequelize: Sequelize): DbModel<Invite> => {
    class InviteModel extends Model<Invite> {
        static associate(db: Db) {
            // define association here
        }
    }
    InviteModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            forOrganizationId: DataTypes.STRING,
            maxUses: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            uses: DataTypes.INTEGER,
            createdById: DataTypes.STRING,
            createdAt: DataTypes.STRING,
            revokedAt: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        { sequelize, timestamps: false, modelName: 'Invite' }
    );

    return InviteModel;
};
