import { darkDefaultTheme, lightDefaultTheme, Theme } from '@blocknote/mantine';

const sharedTheme: Theme = {
    borderRadius: 4,
    fontFamily: 'Helvetica Neue, sans-serif',
};

const lightTheme: Theme = {
    ...sharedTheme,
    colors: {
        editor: {
            text: '#222222',
            background: '#ffeeee',
        },
        menu: {
            text: '#ffffff',
            background: '#9b0000',
        },
        tooltip: {
            text: '#ffffff',
            background: '#b00000',
        },
        hovered: {
            text: '#ffffff',
            background: '#b00000',
        },
        selected: {
            text: '#ffffff',
            background: '#c50000',
        },
        disabled: {
            text: '#9b0000',
            background: '#7d0000',
        },
        shadow: '#640000',
        border: '#870000',
        sideMenu: '#bababa',
        highlights: lightDefaultTheme.colors.highlights,
    },
};

const darkTheme: Theme = {
    ...sharedTheme,
    colors: {
        editor: {
            text: '#ffffff',
            background: '#00000000',
        },
        menu: {
            text: '#ffffff',
            background: '#17191b',
        },
        tooltip: {
            text: '#ffffff',
            background: '#17191b',
        },
        hovered: {
            text: '#ffffff',
            background: '#17191b',
        },
        selected: {
            text: '#ffffff',
            background: '#484f57',
        },
        disabled: {
            text: '#34373b',
            background: '#00000040',
        },
        shadow: '#00000000',
        border: '#828282',
        sideMenu: '#828282',
        highlights: darkDefaultTheme.colors.highlights,
    },
};

export const blockNoteEditorTheme = {
    light: lightTheme,
    dark: darkTheme,
};
