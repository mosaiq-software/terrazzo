import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@trz-api/utils/dbHelper';
import { EntityId, MembershipRecord, MembershipRecordId, OrganizationId, ProjectId, UID, UserId } from '@mosaiq/terrazzo-common/types';
import { EntityType, Role } from '@mosaiq/terrazzo-common/constants';

class MembershipModel extends Model {}
MembershipModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    userId: DataTypes.STRING,
    entityId: DataTypes.STRING,
    entityType: DataTypes.TINYINT,
    userRole: DataTypes.TINYINT,
}, { sequelize});


export const getMembershipById = async (id: MembershipRecordId) => {
    return (await MembershipModel.findByPk(id, {
        attributes:{
            exclude:['updatedAt']
        }}))?.toJSON() as MembershipRecord | null;
}

export const getMembershipRecordsForUser = async (userId:UserId, entityType: EntityType) => {
    return ((await MembershipModel.findAll({where: {userId, entityType}})).map(r=>r.toJSON())) as MembershipRecord[];
}

export const getMembershipRecordsForUserInEntity = async (userId:UserId, entityId: EntityId) => {
    return ((await MembershipModel.findAll({where: {userId, entityId}})).map(r=>r.toJSON())) as MembershipRecord[];
}

export const createMembershipRecord = async (userId:UserId, entityId:EntityId, entityType: EntityType, userRole: Role) => {
    return await MembershipModel.create({
        id: crypto.randomUUID(),
        userId,
        entityId,
        userRole,
        entityType,
    });
}

export const updateMembershipRecord = async (record: MembershipRecord) => {
    return await MembershipModel.update({
        userRole: record.userRole,
    }, { where: { id:record.id } });
};

export const deleteMembershipRecord = async (membershipRecordId: MembershipRecordId) => {
    return await MembershipModel.destroy({ where: { id: membershipRecordId} });
}

export const getMembershipRecordForEntity = async (entityId: EntityId) => {
    return ((await MembershipModel.findAll({where: {entityId}})).map(r=>r.toJSON())) as MembershipRecord[];
}