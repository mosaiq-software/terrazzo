import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { Invite, InviteId, OrganizationId, ProjectId, UserId } from '@mosaiq/terrazzo-common/types';

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

export const getInviteById = async (id: InviteId) => {
    return (await InviteModel.findByPk(id, {
        attributes:{
            exclude:['updatedAt']
        }}))?.toJSON() as Invite | undefined;
}

export const getInvitesToUser = async (userId: UserId) => {
    return (await InviteModel.findAll({
        where: { toUser: userId },
        order: [['createdAt', 'DESC']],
        attributes:{
            exclude:['updatedAt']
        }
    })).map(prj => prj.toJSON()) as Invite[];
}

export const getInvitesFromUser = async (userId: UserId) => {
    return (await InviteModel.findAll({
        where: { fromUser: userId },
        order: [['createdAt', 'DESC']],
        attributes:{
            exclude:['updatedAt']
        }
    })).map(prj => prj.toJSON()) as Invite[];
}

export const getAllInvitesForEntity = async (entityId: ProjectId | OrganizationId) => {
    return (await InviteModel.findAll({
        where: { entityId },
        order: [['createdAt', 'DESC']],
        attributes:{
            exclude:['updatedAt']
        }
    })).map(prj => prj.toJSON()) as Invite[];
}

export const createInvite = async (invite: Invite) => {
    return await InviteModel.create({
        id: invite.id,
        toUser: invite.toUser,
        fromUser: invite.fromUser,
        createdAt: invite.createdAt,
        entityId: invite.entityId,
        entityType: invite.entityType,
        userRole: invite.role,
    });
}

export const deleteInvite = async (inviteId: InviteId) => {
    return await InviteModel.destroy({ where: { id: inviteId } });
}
