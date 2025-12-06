import { BoardHeader } from './board/boardTypes';
import { DirectoryHeader } from './directoryTypes';
import { DocumentHeader } from './documentTypes';

export type TrzModule = DirectoryHeader | DocumentHeader | BoardHeader;
