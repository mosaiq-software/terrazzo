import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { OrganizationId, ProjectId, UID, UserId } from '@mosaiq/terrazzo-common/types';
import { Role } from '@mosaiq/terrazzo-common/constants';

class MembershipModel extends Model {}
MembershipModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    userId: DataTypes.STRING,
    entityId: DataTypes.STRING,
    userRole: DataTypes.TINYINT,
}, { sequelize, modelName: 'membershipModel' });

sequelize.sync();

export const getMembershipById = async (id: UID) => {
    return (await MembershipModel.findByPk(id, {
        attributes:{
            exclude:['updatedAt']
        }}))?.toJSON() as UID | undefined;
}

export const createMembershipRecord = async (user:UserId, entity:ProjectId|OrganizationId, role: Role) => {
    return await MembershipModel.create({
        id: crypto.randomUUID(),
        userId: user,
        entityId: entity,
        userRole: role,
    });
}

export const updateMembershipRole = async (user:UserId, entity:ProjectId|OrganizationId, role: Role) => {
    return await MembershipModel.update({
        userRole: role,
    }, { where: { userId: user, entityId: entity } });
};

export const deleteMembershipRecord = async (user:UserId, entity:ProjectId|OrganizationId) => {
    return await MembershipModel.destroy({ where: { userId: user, entityId: entity } });
}