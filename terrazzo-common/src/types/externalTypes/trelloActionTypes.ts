export interface TrelloActionMember {
    id: string;
    activityBlocked: boolean;
    avatarHash: string;
    avatarUrl: string;
    fullName: string;
    idMemberReferrer: string | null;
    initials: string;
    nonPublic: Record<string, unknown>;
    nonPublicAvailable: boolean;
    username: string;
}

export interface TrelloActionBoardRef {
    id: string;
    name: string;
    shortLink: string;
}

export interface TrelloActionBoardUpdate extends TrelloActionBoardRef {
    closed?: boolean;
    prefs?: Record<string, unknown>;
}

export interface TrelloActionListRef {
    id: string;
    name: string;
}

export interface TrelloActionListUpdate extends TrelloActionListRef {
    pos?: number;
    closed?: boolean;
}

export interface TrelloActionCardRef {
    id: string;
    name: string;
    idShort: number;
    shortLink: string;
}

export interface TrelloActionCardUpdate extends TrelloActionCardRef {
    idLabels?: string[];
    idList?: string;
    desc?: string;
    closed?: boolean;
    dateClosed?: string | null;
    pos?: number;
}

export interface TrelloActionOrganizationRef {
    id: string;
    name: string;
}

export interface TrelloActionChecklistRef {
    id: string;
    name: string;
}

export interface TrelloActionCheckItemRef {
    id: string;
    name: string;
    state: string;
    textData: {
        emoji: Record<string, unknown>;
    };
}

export interface TrelloActionAttachmentRef {
    id: string;
    name: string;
    url: string;
    previewUrl: string;
    previewUrl2x: string;
}

export interface TrelloActionPluginIcon {
    url: string;
}

export interface TrelloActionPluginListing {
    name: string;
    locale: string;
    description: string;
    overview: string;
}

export interface TrelloActionPlugin {
    id: string;
    idOrganizationOwner: string;
    author: string;
    capabilities: string[];
    capabilitiesOptions: unknown[];
    categories: string[];
    iframeConnectorUrl: string;
    name: string;
    privacyUrl: string;
    public: boolean;
    moderatedState: string | null;
    supportEmail: string;
    tags: unknown[];
    heroImageUrl: string | null;
    claimedDomains: string[];
    icon: TrelloActionPluginIcon;
    listing: TrelloActionPluginListing;
    isCompliantWithPrivacyStandards: boolean | null;
    usageBrackets: {
        boards: number;
    };
}

export interface TrelloActionBase {
    id: string;
    idMemberCreator: string;
    appCreator: null;
    date: string;
    limits: {
        reactions?: {
            perAction: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
            uniquePerAction: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
    } | null;
    memberCreator?: TrelloActionMember;
    member?: TrelloActionMember;
}

export interface TrelloActionAddAttachmentToCard extends TrelloActionBase {
    type: 'addAttachmentToCard';
    data: {
        attachment: TrelloActionAttachmentRef;
        card: TrelloActionCardRef;
        list: TrelloActionListRef;
        board: TrelloActionBoardRef;
    };
}

export interface TrelloActionAddChecklistToCard extends TrelloActionBase {
    type: 'addChecklistToCard';
    data: {
        card: TrelloActionCardRef;
        checklist: TrelloActionChecklistRef;
        board: TrelloActionBoardRef;
    };
}

export interface TrelloActionAddMemberToBoard extends TrelloActionBase {
    type: 'addMemberToBoard';
    data: {
        idMemberAdded: string;
        idMemberInviter: string;
        memberType: string;
        method: string;
        board: TrelloActionBoardRef;
    };
}

export interface TrelloActionAddMemberToCard extends TrelloActionBase {
    type: 'addMemberToCard';
    data: {
        idMember: string;
        card: TrelloActionCardRef;
        board: TrelloActionBoardRef;
        member: {
            id: string;
            name: string;
        };
    };
}

export interface TrelloActionAddToOrganizationBoard extends TrelloActionBase {
    type: 'addToOrganizationBoard';
    data: {
        board: TrelloActionBoardRef;
        organization: TrelloActionOrganizationRef;
    };
}

export interface TrelloActionCommentCard extends TrelloActionBase {
    type: 'commentCard';
    data: {
        idCard: string;
        idAuthor: string;
        text: string;
        textData: {
            emoji: Record<string, unknown>;
        };
        card: TrelloActionCardRef;
        board: TrelloActionBoardRef;
        list: TrelloActionListRef;
    };
}

export interface TrelloActionCopyBoard extends TrelloActionBase {
    type: 'copyBoard';
    data: {
        board: TrelloActionBoardRef;
        boardSource: {
            id: string;
            prefs: {
                isTemplate: boolean;
            };
        };
    };
}

export interface TrelloActionCreateCard extends TrelloActionBase {
    type: 'createCard';
    data: {
        card: TrelloActionCardRef;
        list: TrelloActionListRef;
        board: TrelloActionBoardRef;
    };
}

export interface TrelloActionCreateList extends TrelloActionBase {
    type: 'createList';
    data: {
        list: TrelloActionListRef;
        board: TrelloActionBoardRef;
    };
}

export interface TrelloActionDisablePlugin extends TrelloActionBase {
    type: 'disablePlugin';
    data: {
        plugin: TrelloActionPlugin;
        board: TrelloActionBoardRef;
    };
}

export interface TrelloActionEnablePlugin extends TrelloActionBase {
    type: 'enablePlugin';
    data: {
        plugin: TrelloActionPlugin;
        board: TrelloActionBoardRef;
    };
}

export interface TrelloActionMakeAdminOfBoard extends TrelloActionBase {
    type: 'makeAdminOfBoard';
    data: {
        idMember: string;
        board: TrelloActionBoardRef;
    };
}

export interface TrelloActionRemoveMemberFromCard extends TrelloActionBase {
    type: 'removeMemberFromCard';
    data: {
        idMember: string;
        deactivated: boolean;
        card: TrelloActionCardRef;
        board: TrelloActionBoardRef;
        member: {
            id: string;
            name: string;
        };
    };
}

export interface TrelloActionUpdateBoard extends TrelloActionBase {
    type: 'updateBoard';
    data: {
        old: {
            closed?: boolean;
            name?: string;
            prefs?: Record<string, unknown>;
        };
        board: TrelloActionBoardUpdate;
    };
}

export interface TrelloActionUpdateCard extends TrelloActionBase {
    type: 'updateCard';
    data: {
        card: TrelloActionCardUpdate;
        old: {
            closed?: boolean;
            desc?: string;
            idLabels?: string[];
            idList?: string;
            name?: string;
            pos?: number;
        };
        board: TrelloActionBoardRef;
        list: TrelloActionListRef;
    };
}

export interface TrelloActionUpdateCheckItemStateOnCard extends TrelloActionBase {
    type: 'updateCheckItemStateOnCard';
    data: {
        board: TrelloActionBoardRef;
        card: TrelloActionCardRef;
        checklist: TrelloActionChecklistRef;
        checkItem: TrelloActionCheckItemRef;
    };
}

export interface TrelloActionUpdateList extends TrelloActionBase {
    type: 'updateList';
    data: {
        list: TrelloActionListUpdate;
        old: {
            closed?: boolean;
            pos?: number;
        };
        board: TrelloActionBoardRef;
    };
}

export type TrelloActionType =
    | TrelloActionAddAttachmentToCard
    | TrelloActionAddChecklistToCard
    | TrelloActionAddMemberToBoard
    | TrelloActionAddMemberToCard
    | TrelloActionAddToOrganizationBoard
    | TrelloActionCommentCard
    | TrelloActionCopyBoard
    | TrelloActionCreateCard
    | TrelloActionCreateList
    | TrelloActionDisablePlugin
    | TrelloActionEnablePlugin
    | TrelloActionMakeAdminOfBoard
    | TrelloActionRemoveMemberFromCard
    | TrelloActionUpdateBoard
    | TrelloActionUpdateCard
    | TrelloActionUpdateCheckItemStateOnCard
    | TrelloActionUpdateList;
