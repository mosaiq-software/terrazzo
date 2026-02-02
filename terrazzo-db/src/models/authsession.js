'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class AuthSession extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    AuthSession.init({
        userId: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        authToken: DataTypes.STRING,
        createdAt: DataTypes.BIGINT
    }, {
        sequelize,
        modelName: 'AuthSession',
        timestamps: false
    });
    return AuthSession;
};