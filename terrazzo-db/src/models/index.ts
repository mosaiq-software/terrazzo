import { recordKeys } from '@mosaiq/terrazzo-common';
import process from 'node:process';
import { Sequelize } from 'sequelize';
import configs from '../config';
import { Db, DbModel } from '../dbTypes';
import { AuthSessionModel } from './authsession';
import { BoardModel } from './board';
import { CardModel } from './card';
import { CardAssignmentModel } from './cardassignment';
import { DirectoryModel } from './directory';
import { DocumentModel } from './document';
import { FileModel } from './file';
import { InviteModel } from './invite';
import { LabelModel } from './label';
import { LabelAssignmentModel } from './labelassignment';
import { LinkedAccountModel } from './linkedaccount';
import { ListModel } from './list';
import { ModuleModel } from './module';
import { OrganizationModel } from './organization';
import { OrganizationMembershipModel } from './organizationmembership';
import { RoleModel } from './role';
import { RoleAssignmentModel } from './roleassignment';
import { TextBlockModel } from './textblock';
import { TextBlockHistoryModel } from './textblockhistory';
import { UserModel } from './user';

const env = process.env.TRZ_ENV || 'development';
const volumePath = process.env.VOLUME_PATH || '';

const config = configs[env];
if (!config) {
    throw new Error(`Database config for environment "${env}" was not found`);
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${volumePath}/db/terrazzo.sqlite`,
    logging: process.env.DATABASE_LOGGING === 'true',
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Database connection established.');
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
    });

const models: Record<string, DbModel> = {
    AuthSession: AuthSessionModel(sequelize),
    Board: BoardModel(sequelize),
    Card: CardModel(sequelize),
    CardAssignment: CardAssignmentModel(sequelize),
    Directory: DirectoryModel(sequelize),
    Document: DocumentModel(sequelize),
    File: FileModel(sequelize),
    Invite: InviteModel(sequelize),
    Label: LabelModel(sequelize),
    LabelAssignment: LabelAssignmentModel(sequelize),
    LinkedAccount: LinkedAccountModel(sequelize),
    List: ListModel(sequelize),
    Module: ModuleModel(sequelize),
    Organization: OrganizationModel(sequelize),
    OrganizationMembership: OrganizationMembershipModel(sequelize),
    Role: RoleModel(sequelize),
    RoleAssignment: RoleAssignmentModel(sequelize),
    TextBlock: TextBlockModel(sequelize),
    TextBlockHistory: TextBlockHistoryModel(sequelize),
    User: UserModel(sequelize),
};

const db: Db = {
    sequelize,
    Sequelize,
    ...models,
};

recordKeys(models).forEach((modelName) => {
    const model = models[modelName];
    if (model.associate) {
        model.associate(db);
    }
});

export default db;
