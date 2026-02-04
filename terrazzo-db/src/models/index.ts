import { recordKeys } from '@mosaiq/terrazzo-common';
import process from 'node:process';
import { Sequelize } from 'sequelize';
import configs from '../config';
import { Db, DbModels } from '../dbTypes';
import { getAuthSessionModel } from './authSessionModel';
import type { BoardModelType } from './boardModel';
import { getBoardModel } from './boardModel';
import type { CardAssignmentModelType } from './cardAssignmentModel';
import { getCardAssignmentModel } from './cardAssignmentModel';
import type { CardModelType } from './cardModel';
import { getCardModel } from './cardModel';
import type { DirectoryModelType } from './directoryModel';
import { getDirectoryModel } from './directoryModel';
import type { DocumentModelType } from './documentModel';
import { getDocumentModel } from './documentModel';
import type { FileModelType } from './fileModel';
import { getFileModel } from './fileModel';
import type { InviteModelType } from './inviteModel';
import { getInviteModel } from './inviteModel';
import type { LabelAssignmentModelType } from './labelAssignmentModel';
import { getLabelAssignmentModel } from './labelAssignmentModel';
import type { LabelModelType } from './labelModel';
import { getLabelModel } from './labelModel';
import type { LinkedAccountModelType } from './linkedAccountModel';
import { getLinkedAccountModel } from './linkedAccountModel';
import type { ListModelType } from './listModel';
import { getListModel } from './listModel';
import type { ModuleModelType } from './moduleModel';
import { getModuleModel } from './moduleModel';
import type { OrganizationMembershipModelType } from './organizationMembershipModel';
import { getOrganizationMembershipModel } from './organizationMembershipModel';
import type { OrganizationModelType } from './organizationModel';
import { getOrganizationModel } from './organizationModel';
import type { RoleAssignmentModelType } from './roleAssignmentModel';
import { getRoleAssignmentModel } from './roleAssignmentModel';
import type { RoleModelType } from './roleModel';
import { getRoleModel } from './roleModel';
import type { TextBlockHistoryModelType } from './textBlockHistoryModel';
import { getTextBlockHistoryModel } from './textBlockHistoryModel';
import type { TextBlockModelType } from './textBlockModel';
import { getTextBlockModel } from './textBlockModel';
import type { UserModelType } from './userModel';
import { getUserModel } from './userModel';

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
    BoardModelType,
    CardAssignmentModel,
    CardAssignmentModelType,
    CardModel,
    CardModelType,
    DirectoryModel,
    DirectoryModelType,
    DocumentModel,
    DocumentModelType,
    FileModel,
    FileModelType,
    InviteModel,
    InviteModelType,
    LabelAssignmentModel,
    LabelAssignmentModelType,
    LabelModel,
    LabelModelType,
    LinkedAccountModel,
    LinkedAccountModelType,
    ListModel,
    ListModelType,
    ModuleModel,
    ModuleModelType,
    OrganizationMembershipModel,
    OrganizationMembershipModelType,
    OrganizationModel,
    OrganizationModelType,
    RoleAssignmentModel,
    RoleAssignmentModelType,
    RoleModel,
    RoleModelType,
    sequelize,
    TextBlockHistoryModel,
    TextBlockHistoryModelType,
    TextBlockModel,
    TextBlockModelType,
    UserModel,
    UserModelType,
};
export default db;
