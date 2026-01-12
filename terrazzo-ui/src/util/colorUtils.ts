export function colorIsDarkAdvanced(bgColor: string) {
    // https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
    const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16); // hexToR
    const g = parseInt(color.substring(2, 4), 16); // hexToG
    const b = parseInt(color.substring(4, 6), 16); // hexToB
    const uicolors = [r / 255, g / 255, b / 255];
    const c = uicolors.map((col) => {
        if (col <= 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return L <= 0.179;
}

export function generateRandomColor() {
    // https://stackoverflow.com/questions/5092808/how-do-i-randomly-generate-html-hex-color-codes-using-javascript
    return '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
}

/**
 * Creates a hex color code based on a string input.
 * All colors will be mid-range brightness/saturation for readability. The hue is derived from the string.
 */
export const getRandomColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 23) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 40%)`;
};
