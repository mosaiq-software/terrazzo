import { LinkedAccount, LinkedAccountProvider, UserId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class LinkedAccountModel extends Model<LinkedAccount> {}
LinkedAccountModel.init(
    {
        provider: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        accountId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        accountData: DataTypes.JSON,
    },
    { sequelize, timestamps: false }
);

export const getLinkedAccountsForUserDb = async (userId: UserId) => {
    const models = await LinkedAccountModel.findAll({ where: { userId } });
    return models.map((model) => model.toJSON());
};

export const getLinkedAccountForProviderDb = async (provider: LinkedAccountProvider, accountId: string) => {
    const model = await LinkedAccountModel.findOne({ where: { provider, accountId } });
    return model?.toJSON();
};

export const createLinkedAccountDb = async (linkedAccount: LinkedAccount) => {
    const model = await LinkedAccountModel.create({ ...linkedAccount });
    return model.toJSON();
};

export const deleteLinkedAccountDb = async (provider: LinkedAccountProvider, accountId: string, userId: UserId) => {
    const deleted = await LinkedAccountModel.destroy({ where: { provider, accountId, userId } });
    return deleted;
};
