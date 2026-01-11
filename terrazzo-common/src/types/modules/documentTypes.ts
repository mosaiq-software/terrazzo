import { TextBlockId, UserId } from '../genericTypes';
import { ModuleHeader, TrzModuleType } from './moduleTypes';

export interface DocumentHeader extends ModuleHeader {
    type: TrzModuleType.Document;
    textBlockId: TextBlockId;
    lastModifiedAt: number;
    lastModifiedByUserId: UserId;
}
