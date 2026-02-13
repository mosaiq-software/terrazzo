import { darkDefaultTheme, Theme } from '@blocknote/mantine';
import { COLORS } from '@trz/util/colors';

const sharedTheme: Theme = {
    borderRadius: 4,
    fontFamily: 'Helvetica Neue, sans-serif',
};

const lightTheme: Theme = {
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
