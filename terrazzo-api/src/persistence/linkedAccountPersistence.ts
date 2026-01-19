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
        privateAccountData: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    { sequelize, timestamps: false, tableName: 'LinkedAccounts' }
);

export const getLinkedAccountsForUserDb = async (userId: UserId) => {
    const models = await LinkedAccountModel.findAll({
        where: { userId },
        attributes: {
            exclude: ['privateAccountData'],
        },
    });
    return models.map((model) => {
        const data = model.toJSON();
        delete data.privateAccountData;
        return data;
    });
};

export const getLinkedAccountForProviderDb = async (provider: LinkedAccountProvider, accountId: string) => {
    const model = await LinkedAccountModel.findOne({
        where: { provider, accountId },
        attributes: {
            exclude: ['privateAccountData'],
        },
    });
    if (!model) {
        return undefined;
    }
    const data = model.toJSON();
    delete data.privateAccountData;
    return data;
};

export const getPrivateLinkedAccountDb = async (provider: LinkedAccountProvider, accountId: string, userId: UserId) => {
    const model = await LinkedAccountModel.findOne({
        where: { provider, accountId, userId },
    });
    if (!model) {
        return undefined;
    }
    return model.toJSON();
};

export const createLinkedAccountDb = async (linkedAccount: LinkedAccount) => {
    const model = await LinkedAccountModel.create({ ...linkedAccount });
    return model.toJSON();
};

export const deleteLinkedAccountDb = async (provider: LinkedAccountProvider, accountId: string, userId: UserId) => {
    const deleted = await LinkedAccountModel.destroy({ where: { provider, accountId, userId } });
    return deleted;
};

export const updateLinkedAccountDb = async (
    provider: LinkedAccountProvider,
    accountId: string,
    userId: UserId,
    updates: Partial<LinkedAccount>
) => {
    const [updatedCount] = await LinkedAccountModel.update(updates, { where: { provider, accountId, userId } });
    return updatedCount;
};
