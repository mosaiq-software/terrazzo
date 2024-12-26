import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';

class Project extends Model {}
Project.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    archived: DataTypes.BOOLEAN
}, { sequelize, modelName: 'project' });

sequelize.sync();
