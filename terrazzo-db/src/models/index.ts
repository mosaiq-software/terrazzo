import process from 'node:process';
import { Sequelize } from 'sequelize';
import configs from '../config';
import { Db } from '../dbTypes';
import { getAuthSessionModel } from './authsession';
import { getBoardModel } from './board';
import { getCardModel } from './card';
import { getCardAssignmentModel } from './cardassignment';
import { getDirectoryModel } from './directory';
import { getDocumentModel } from './document';
import { getFileModel } from './file';
import { getInviteModel } from './invite';
import { getLabelModel } from './label';
import { getLabelAssignmentModel } from './labelassignment';
import { getLinkedAccountModel } from './linkedaccount';
import { getListModel } from './list';
import { getModuleModel } from './module';
import { getOrganizationModel } from './organization';
import { getOrganizationMembershipModel } from './organizationmembership';
import { getRoleModel } from './role';
import { getRoleAssignmentModel } from './roleassignment';
import { getTextBlockModel } from './textblock';
import { getTextBlockHistoryModel } from './textblockhistory';
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

const db: Db = {
    sequelize,
    Sequelize,
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

AuthSessionModel.associate?.(db);
BoardModel.associate?.(db);
CardModel.associate?.(db);
CardAssignmentModel.associate?.(db);
DirectoryModel.associate?.(db);
DocumentModel.associate?.(db);
FileModel.associate?.(db);
InviteModel.associate?.(db);
LabelModel.associate?.(db);
LabelAssignmentModel.associate?.(db);
LinkedAccountModel.associate?.(db);
ListModel.associate?.(db);
ModuleModel.associate?.(db);
OrganizationModel.associate?.(db);
OrganizationMembershipModel.associate?.(db);
RoleModel.associate?.(db);
RoleAssignmentModel.associate?.(db);
TextBlockModel.associate?.(db);
TextBlockHistoryModel.associate?.(db);
UserModel.associate?.(db);

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
