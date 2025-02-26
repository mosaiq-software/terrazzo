import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { OrganizationId, Project, ProjectHeader, ProjectId } from '@mosaiq/terrazzo-common/types';

class ProjectModel extends Model {}
ProjectModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    orgId: DataTypes.STRING,
    name: DataTypes.STRING,
    archived: DataTypes.BOOLEAN,
    createdAt: DataTypes.INTEGER,
    logoUrl: DataTypes.STRING,
}, { sequelize, modelName: 'projectModel' });

sequelize.sync();

export const getProjectById = async (id: ProjectId) => {
    return (await ProjectModel.findByPk(id, {
        attributes:{
            exclude:['updatedAt']
        }}))?.toJSON() as ProjectHeader | undefined;
}

export const getProjectsByOrdId = async (orgId: OrganizationId) => {
    return (await ProjectModel.findAll({
        where: { orgId },
        order: [['createdAt', 'ASC']],
        attributes:{
            exclude:['createdAt', 'updatedAt']
        }
    })).map(prj => prj.toJSON()) as ProjectHeader[];
}

export const createProject = async (project: ProjectHeader) => {
    return await ProjectModel.create({
        id: project.id,
        orgId: project.orgId,
        name: project.name,
        archived: false,
        createdAt: project.createdAt,
        logoUrl: project.logoUrl,
    });
}

export const updateProject = async (project: ProjectHeader) => {
    return await ProjectModel.update({
        name: project.name,
        orgId: project.orgId,
        archived: project.archived,
        logoUrl: project.logoUrl,
    }, { where: { id: project.id } });
};