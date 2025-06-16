import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@trz-api/utils/dbHelper';
import { Sprint } from '@mosaiq/terrazzo-common/types';

class SprintModel extends Model {}
SprintModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
}, { sequelize});


export const getSprintById = async (id: string) => {
    return (await SprintModel.findByPk(id))?.toJSON() as Sprint | null;
}

export const createSprint = async (sprint: Sprint) => {
    return await SprintModel.create({
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
    });
}

export const updateSprint = async (sprint: Sprint) => {
    return await SprintModel.update({
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
    }, { where: { id: sprint.id } });
};
