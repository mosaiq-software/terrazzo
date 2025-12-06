export interface TrelloExportType {
    id: string;
    nodeId: string;
    name: string;
    desc: string;
    descData: null;
    closed: boolean;
    dateClosed: string;
    idOrganization: string;
    idEnterprise: string;
    pinned: boolean;
    starred: boolean;
    url: string;
    shortLink: string;
    subscribed: boolean;
    dateLastActivity: string;
    dateLastView: string;
    shortUrl: string;
    datePluginDisable: string;
    creationMethod: null;
    ixUpdate: string;
    templateGallery: null;
    enterpriseOwned: boolean;
    idBoardSource: string;
    idMemberCreator: string;
    type: null;
    limits: {
        attachments: {
            perBoard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
            perCard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        boards: {
            totalMembersPerBoard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
            totalAccessRequestsPerBoard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        cards: {
            openPerBoard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
            openPerList: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
            totalPerBoard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
            totalPerList: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        checklists: {
            perBoard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
            perCard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        checkItems: {
            perChecklist: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        customFields: {
            perBoard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        customFieldOptions: {
            perField: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        labels: {
            perBoard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        lists: {
            openPerBoard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
            totalPerBoard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        stickers: {
            perCard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        reactions: {
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
    };
    prefs: {
        permissionLevel: string;
        hideVotes: boolean;
        voting: string;
        comments: string;
        invitations: string;
        selfJoin: boolean;
        cardCovers: boolean;
        showCompleteStatus: boolean;
        cardCounts: boolean;
        isTemplate: boolean;
        cardAging: string;
        calendarFeedEnabled: boolean;
        hiddenPluginBoardButtons: [];
        switcherViews: [
            {
                viewType: 'Board';
                enabled: boolean;
            },
            {
                viewType: 'Table';
                enabled: boolean;
            },
            {
                viewType: 'Calendar';
                enabled: boolean;
            },
            {
                viewType: 'Dashboard';
                enabled: boolean;
            },
            {
                viewType: 'Timeline';
                enabled: boolean;
            },
            {
                viewType: 'Map';
                enabled: boolean;
            },
        ];
        autoArchive: null;
        background: string;
        backgroundColor: string;
        backgroundDarkColor: null;
        backgroundImage: string;
        backgroundDarkImage: null;
        backgroundImageScaled: null;
        backgroundTile: false;
        backgroundBrightness: string;
        sharedSourceUrl: null;
        backgroundBottomColor: string;
        backgroundTopColor: string;
        canBePublic: boolean;
        canBeEnterprise: boolean;
        canBeOrg: boolean;
        canBePrivate: boolean;
        canInvite: boolean;
    };
    labelNames: {
        green: string;
        yellow: string;
        orange: string;
        red: string;
        purple: string;
        blue: string;
        sky: string;
        lime: string;
        pink: string;
        black: string;
        green_dark: string;
        yellow_dark: string;
        orange_dark: string;
        red_dark: string;
        purple_dark: string;
        blue_dark: string;
        sky_dark: string;
        lime_dark: string;
        pink_dark: string;
        black_dark: string;
        green_light: string;
        yellow_light: string;
        orange_light: string;
        red_light: string;
        purple_light: string;
        blue_light: string;
        sky_light: string;
        lime_light: string;
        pink_light: string;
        black_light: string;
    };
    powerUps: unknown[];
    idTags: unknown[];
    premiumFeatures: string[];
    actions: [];
    cards: TrelloCardType[];
    labels: {
        id: string;
        idBoard: string;
        name: string;
        color: string;
        uses: number;
    }[];
    lists: TrelloListType[];
    members: TrelloMemberType[];
    checklists: TrelloChecklistType[];
    customFields: unknown[];
    memberships: TrelloMembershipType[];
    pluginData: TrelloPluginType[];
}
export interface TrelloCardType {
    id: string;
    address: null;
    badges: {
        attachments: number;
        fogbugz: string;
        checkItems: number;
        checkItemsChecked: number;
        checkItemsEarliestDue: null;
        comments: number;
        description: boolean;
        due: string | null;
        dueComplete: boolean;
        lastUpdatedByAi: boolean;
        start: string | null;
        externalSource: null;
        attachmentsByType: {
            trello: {
                board: number;
                card: number;
            };
        };
        location: boolean;
        votes: number;
        maliciousAttachments: number;
        viewingMemberVoted: boolean;
        subscribed: boolean;
    };
    checkItemStates: {
        idCheckItem: string;
        state: string;
    }[];
    closed: false;
    coordinates: null;
    creationMethod: null;
    creationMethodError: null;
    creationMethodLoadingStartedAt: null;
    dueComplete: false;
    dateClosed: null;
    dateLastActivity: 'string';
    dateCompleted: null;
    dateViewedByCreator: null;
    desc: 'string smaller stories';
    descData: {
        emoji: unknown;
    };
    due: string | null;
    dueReminder: null;
    email: string;
    externalSource: null;
    idBoard: string;
    idChecklists: string[];
    idLabels: string[];
    idList: string;
    idMemberCreator: string;
    idMembers: string[];
    idMembersVoted: string[];
    idOrganization: string;
    idShort: number;
    idAttachmentCover: null;
    labels: [
        {
            id: string;
            idBoard: string;
            idOrganization: string;
            name: string;
            nodeId: string;
            color: string;
            uses: number;
        },
    ];
    limits: {
        attachments: {
            perCard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        checklists: {
            perCard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
        stickers: {
            perCard: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
    };
    locationName: null;
    manualCoverAttachment: boolean;
    name: string;
    nodeId: string;
    pinned: boolean;
    pos: number;
    shortLink: string;
    shortUrl: string;
    singleInstrumentationId: null;
    sourceEmail: null;
    staticMapUrl: null;
    start: null;
    subscribed: boolean;
    url: string;
    cover: {
        idAttachment: null;
        color: null;
        idUploadedBackground: null;
        size: string;
        brightness: string;
        idPlugin: null;
    };
    isTemplate: boolean;
    cardRole: null;
    mirrorSourceId: null;
    mirrorSourceNodeId: null;
    attachments: [];
    pluginData: [
        {
            id: string;
            idPlugin: string;
            scope: string;
            idModel: string;
            value: string;
            access: string;
            dateLastUpdated: string;
        },
    ];
    customFieldItems: [];
}
export interface TrelloListType {
    id: string;
    name: 'Done';
    closed: boolean;
    color: null;
    idBoard: string;
    pos: number;
    subscribed: boolean;
    softLimit: null;
    type: null;
    datasource: {
        filter: boolean;
    };
    creationMethod: null;
    idOrganization: string;
    limits: {
        cards: {
            openPerList: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
            totalPerList: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
    };
    nodeId: string;
}
export interface TrelloMemberType {
    id: string;
    aaId: string;
    activityBlocked: boolean;
    avatarHash: string;
    avatarUrl: string;
    bio: string;
    bioData: null;
    confirmed: boolean;
    fullName: string;
    idEnterprise: null;
    idEnterprisesDeactivated: null;
    idMemberReferrer: null;
    idPremOrgsAdmin: unknown[];
    initials: string;
    memberType: string;
    nonPublic: unknown;
    nonPublicAvailable: boolean;
    products: unknown[];
    url: string;
    username: string;
    status: string;
}
export interface TrelloChecklistType {
    id: string;
    name: string;
    idBoard: string;
    idCard: string;
    pos: number;
    limits: {
        checkItems: {
            perChecklist: {
                status: string;
                disableAt: number;
                warnAt: number;
            };
        };
    };
    checkItems: TrelloChecklistItemType[];
    creationMethod: null;
}
export interface TrelloChecklistItemType {
    id: string;
    name: string;
    nameData: {
        emoji: unknown;
    };
    pos: number;
    state: string;
    due: null;
    dueReminder: null;
    idMember: null;
    idChecklist: string;
}
export interface TrelloMembershipType {
    id: string;
    idMember: string;
    memberType: string;
    unconfirmed: boolean;
    deactivated: boolean;
}
export interface TrelloPluginType {
    id: string;
    idPlugin: string;
    scope: string;
    idModel: string;
    value: string;
    access: string;
    dateLastUpdated: string;
}

export const TrelloLabelColorsMap: { [key: string]: string } = {
    green: '#216e4e',
    yellow: '#7f5f01',
    orange: '#a54800',
    red: '#ae2e24',
    purple: '#5e4db2',
    blue: '#0055cc',
    sky: '#206a83',
    lime: '#4c6b1f',
    pink: '#943d73',
    black: '#596773',
    green_dark: '#164b35',
    yellow_dark: '#533f04',
    orange_dark: '#5d1f1a',
    red_dark: '#5d1f1a',
    purple_dark: '#282e33',
    blue_dark: '#09326c',
    sky_dark: '#164555',
    lime_dark: '#37471f',
    pink_dark: '#50253f',
    black_dark: '#454f59',
    green_light: '#4bce97',
    yellow_light: '#e2b203',
    orange_light: '#fea362',
    red_light: '#f87168',
    purple_light: '#9f8fef',
    blue_light: '#579dff',
    sky_light: '#6cc3e0',
    lime_light: '#94c748',
    pink_light: '#e774bb',
    black_light: '#8c9bab',
};
