import { MembershipRecord } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type OrganizationMembershipModelType = MembershipRecord;

export const getOrganizationMembershipModel = (sequelize: Sequelize): DbModel<OrganizationMembershipModelType> => {
    class OrganizationMembershipModel extends Model<OrganizationMembershipModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
    OrganizationMembershipModel.init(
        {
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            orgId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            joinedAt: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
        },
        { sequelize, timestamps: false, modelName: 'OrganizationMembership' }
    );

    return OrganizationMembershipModel;
};
