import { recordKeys } from '@mosaiq/terrazzo-common';
import process from 'node:process';
import { Sequelize } from 'sequelize';
import configs from '../config';
import { Db, DbModels } from '../dbTypes';
import { getAuthSessionModel } from './authSession';
import { getBoardModel } from './board';
import { getCardModel } from './card';
import { getCardAssignmentModel } from './cardAssignment';
import { getDirectoryModel } from './directory';
import { getDocumentModel } from './document';
import { getFileModel } from './file';
import { getInviteModel } from './invite';
import { getLabelModel } from './label';
import { getLabelAssignmentModel } from './labelAssignment';
import { getLinkedAccountModel } from './linkedAccount';
import { getListModel } from './list';
import { getModuleModel } from './module';
import { getOrganizationModel } from './organization';
import { getOrganizationMembershipModel } from './organizationMembership';
import { getRoleModel } from './role';
import { getRoleAssignmentModel } from './roleAssignment';
import { getTextBlockModel } from './textBlock';
import { getTextBlockHistoryModel } from './textBlockHistory';
import { getUserModel } from './user';

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

const AuthSessionModel = getAuthSessionModel(sequelize);
const BoardModel = getBoardModel(sequelize);
const CardModel = getCardModel(sequelize);
const CardAssignmentModel = getCardAssignmentModel(sequelize);
const DirectoryModel = getDirectoryModel(sequelize);
const DocumentModel = getDocumentModel(sequelize);
const FileModel = getFileModel(sequelize);
const InviteModel = getInviteModel(sequelize);
const LabelModel = getLabelModel(sequelize);
const LabelAssignmentModel = getLabelAssignmentModel(sequelize);
const LinkedAccountModel = getLinkedAccountModel(sequelize);
const ListModel = getListModel(sequelize);
const ModuleModel = getModuleModel(sequelize);
const OrganizationModel = getOrganizationModel(sequelize);
const OrganizationMembershipModel = getOrganizationMembershipModel(sequelize);
const RoleModel = getRoleModel(sequelize);
const RoleAssignmentModel = getRoleAssignmentModel(sequelize);
const TextBlockModel = getTextBlockModel(sequelize);
const TextBlockHistoryModel = getTextBlockHistoryModel(sequelize);
const UserModel = getUserModel(sequelize);

const dbModels: DbModels = {
    AuthSessionModel,
    BoardModel,
    CardModel,
    CardAssignmentModel,
    DirectoryModel,
    DocumentModel,
    FileModel,
    InviteModel,
    LabelModel,
    LabelAssignmentModel,
    LinkedAccountModel,
    ListModel,
    ModuleModel,
    OrganizationModel,
    OrganizationMembershipModel,
    RoleModel,
    RoleAssignmentModel,
    TextBlockModel,
    TextBlockHistoryModel,
    UserModel,
};

const db: Db = {
    sequelize,
    Sequelize,
    ...dbModels,
};

recordKeys(dbModels).forEach((modelName) => {
    dbModels[modelName]?.associate?.(db);
});

export {
    AuthSessionModel,
    BoardModel,
    CardAssignmentModel,
    CardModel,
    DirectoryModel,
    DocumentModel,
    FileModel,
    InviteModel,
    LabelAssignmentModel,
    LabelModel,
    LinkedAccountModel,
    ListModel,
    ModuleModel,
    OrganizationMembershipModel,
    OrganizationModel,
    RoleAssignmentModel,
    RoleModel,
    sequelize,
    TextBlockHistoryModel,
    TextBlockModel,
    UserModel,
};
export default db;
