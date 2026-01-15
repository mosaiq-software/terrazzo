import { darkDefaultTheme, lightDefaultTheme, Theme } from '@blocknote/mantine';
import { COLORS } from '@trz/util/colors';

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
            text: COLORS.text.primary,
            background: COLORS.transparent,
        },
        menu: {
            text: COLORS.text.primary,
            background: COLORS.background.medium,
        },
        tooltip: {
            text: COLORS.text.primary,
            background: COLORS.background.medium,
        },
        hovered: {
            text: COLORS.text.primary,
            background: COLORS.background.medium,
        },
        selected: {
            text: COLORS.text.primary,
            background: COLORS.foreground.dark,
        },
        disabled: {
            text: COLORS.text.disabled,
            background: COLORS.overlay.dark,
        },
        shadow: COLORS.transparent,
        border: COLORS.border,
        sideMenu: COLORS.foreground.medium,
        highlights: darkDefaultTheme.colors.highlights,
    },
};

export const blockNoteEditorTheme = {
    light: lightTheme,
    dark: darkTheme,
};
