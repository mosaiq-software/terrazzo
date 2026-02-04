import { recordKeys } from '@mosaiq/terrazzo-common';
import process from 'node:process';
import { Sequelize } from 'sequelize';
import configs from '../config';
import { Db, DbModels } from '../dbTypes';
import { getAuthSessionModel } from './authSessionModel';
import { BoardModelType, getBoardModel } from './boardModel';
import { CardAssignmentModelType, getCardAssignmentModel } from './cardAssignmentModel';
import { CardModelType, getCardModel } from './cardModel';
import { DirectoryModelType, getDirectoryModel } from './directoryModel';
import { DocumentModelType, getDocumentModel } from './documentModel';
import { FileModelType, getFileModel } from './fileModel';
import { getInviteModel, InviteModelType } from './inviteModel';
import { getLabelAssignmentModel, LabelAssignmentModelType } from './labelAssignmentModel';
import { getLabelModel, LabelModelType } from './labelModel';
import { getLinkedAccountModel, LinkedAccountModelType } from './linkedAccountModel';
import { getListModel, ListModelType } from './listModel';
import { getModuleModel, ModuleModelType } from './moduleModel';
import { getOrganizationMembershipModel, OrganizationMembershipModelType } from './organizationMembershipModel';
import { getOrganizationModel, OrganizationModelType } from './organizationModel';
import { getRoleAssignmentModel, RoleAssignmentModelType } from './roleAssignmentModel';
import { getRoleModel, RoleModelType } from './roleModel';
import { getTextBlockHistoryModel, TextBlockHistoryModelType } from './textBlockHistoryModel';
import { getTextBlockModel, TextBlockModelType } from './textBlockModel';
import { getUserModel, UserModelType } from './userModel';

const env = process.env.TRZ_ENV || 'development';

const config = configs[env];
if (!config) {
    throw new Error(`Database config for environment "${env}" was not found`);
}

const sequelize = new Sequelize({ ...config });

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

export type {
    BoardModelType,
    CardAssignmentModelType,
    CardModelType,
    DirectoryModelType,
    DocumentModelType,
    FileModelType,
    InviteModelType,
    LabelAssignmentModelType,
    LabelModelType,
    LinkedAccountModelType,
    ListModelType,
    ModuleModelType,
    OrganizationMembershipModelType,
    OrganizationModelType,
    RoleAssignmentModelType,
    RoleModelType,
    TextBlockHistoryModelType,
    TextBlockModelType,
    UserModelType,
};

export default db;
