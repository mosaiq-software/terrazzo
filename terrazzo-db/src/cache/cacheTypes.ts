import { CardId, ListId } from '@mosaiq/terrazzo-common';
import type { BoardModelType } from '../models/boardModel';
import type { CardModelType } from '../models/cardModel';
import type { DirectoryModelType } from '../models/directoryModel';
import type { DocumentModelType } from '../models/documentModel';
import type { FileModelType } from '../models/fileModel';
import type { ListModelType } from '../models/listModel';
import type { ModuleModelType } from '../models/moduleModel';
import type { OrganizationModelType } from '../models/organizationModel';
import type { RoleModelType } from '../models/roleModel';
import type { TextBlockModelType } from '../models/textBlockModel';
import type { UserModelType } from '../models/userModel';

/**
 * Enum of all cacheable entity types.
 * Add new entities here as they become cacheable.
 */
export enum CacheEntity {
    // Simple Models
    User = 'user',
    Board = 'board',
    Card = 'card',
    Directory = 'directory',
    Document = 'document',
    File = 'file',
    List = 'list',
    Module = 'module',
    Organization = 'organization',
    Role = 'role',
    TextBlock = 'textBlock',

    // Composite Models
    CardsInList = 'cardsInList',
    ListsInBoard = 'listsInBoard',
}

/**
 * Type mapping from cache entity to its corresponding data type.
 * This enables type-safe cache operations without explicit type assertions.
 * Maps to the actual model types as defined in the database models.
 */
export interface CacheEntityTypeMap {
    // Simple Models
    [CacheEntity.User]: UserModelType;
    [CacheEntity.Board]: BoardModelType;
    [CacheEntity.Card]: CardModelType;
    [CacheEntity.Directory]: DirectoryModelType;
    [CacheEntity.Document]: DocumentModelType;
    [CacheEntity.File]: FileModelType;
    [CacheEntity.List]: ListModelType;
    [CacheEntity.Module]: ModuleModelType;
    [CacheEntity.Organization]: OrganizationModelType;
    [CacheEntity.Role]: RoleModelType;
    [CacheEntity.TextBlock]: TextBlockModelType;

    // Composite Models
    [CacheEntity.CardsInList]: CardId[];
    [CacheEntity.ListsInBoard]: ListId[];
}

/**
 * Infer the data type for a given cache entity.
 */
export type CacheEntityType<E extends CacheEntity> = CacheEntityTypeMap[E];
