import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { EntityId, Invite, InviteId, InviteRecord, OrganizationId, ProjectId, UserId } from '@mosaiq/terrazzo-common/types';

class InviteModel extends Model {}
InviteModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    toUser: DataTypes.STRING,
    fromUser: DataTypes.STRING,
    createdAt: DataTypes.STRING,
    entityId: DataTypes.STRING,
    entityType: DataTypes.TINYINT,
    userRole: DataTypes.TINYINT,
}, { sequelize, modelName: 'inviteModel' });

sequelize.sync();

export const getInviteRecordById = async (id: InviteId) => {
    return (await InviteModel.findByPk(id, {
        attributes:{
            exclude:['updatedAt']
        }}))?.toJSON() as InviteRecord | undefined;
}

export const getInviteRecordsToUser = async (userId: UserId) => {
    return (await InviteModel.findAll({
        where: { toUser: userId },
        order: [['createdAt', 'DESC']],
        attributes:{
            exclude:['updatedAt']
        }
    })).map(prj => prj.toJSON()) as InviteRecord[];
}

export const getInviteRecordsToUserInEntity = async (userId: UserId, entityId: EntityId) => {
    return (await InviteModel.findAll({
        where: { toUser: userId, entityId},
        order: [['createdAt', 'DESC']],
        attributes:{
            exclude:['updatedAt']
        }
    })).map(prj => prj.toJSON()) as InviteRecord[];
}

export const getAllInviteRecordsForEntity = async (entityId: ProjectId | OrganizationId) => {
    return (await InviteModel.findAll({
        where: { entityId },
        order: [['createdAt', 'DESC']],
        attributes:{
            exclude:['updatedAt']
        }
    })).map(prj => prj.toJSON()) as InviteRecord[];
}

export const createInviteRecord = async (invite: InviteRecord) => {
    return await InviteModel.create({
        id: invite.id,
        toUser: invite.toUser,
        fromUser: invite.fromUser,
        createdAt: invite.createdAt,
        entityId: invite.entityId,
        entityType: invite.entityType,
        userRole: invite.userRole,
    });
}

export const deleteInviteRecord = async (inviteId: InviteId) => {
    return await InviteModel.destroy({ where: { id: inviteId } });
}
