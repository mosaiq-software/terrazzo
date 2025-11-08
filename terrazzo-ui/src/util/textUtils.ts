export const IDLE_TIMEOUT_MS = 1000 * 60 * 3;
export const MOUSE_UPDATE_THROTTLE_MS = 100;
export const TEXT_EVENT_EMIT_THROTTLE_MS = 100;
export const TAB_CHAR = '    ';

export const USERNAME_DEBOUNCE = 500;

const CSS_TA_PROPERTIES = [
    'direction', // RTL support
    'boxSizing',
    'width', // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
    'height',
    'overflowX',
    'overflowY', // copy the scrollbar for IE

    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',

    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',

    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',

    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration', // might not make a difference, but better be safe

    'letterSpacing',
    'wordSpacing',

    'tabSize',
    'MozTabSize',
];

export const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    const isBrowser = typeof window !== 'undefined';
    const isFirefox = isBrowser && (window as any).mozInnerScreenX != null;
    if (!isBrowser) {
        throw new Error('Not a browser!');
    }

    // mirrored div
    const div = document.createElement('div');
    div.id = 'input-textarea-caret-position-mirror-div';
    document.body.appendChild(div);

    const style = div.style;
    const computed = (window as any).getComputedStyle ? getComputedStyle(element) : (element as any).currentStyle; // currentStyle for IE < 9

    // default textarea styles
    style.whiteSpace = 'pre-wrap';
    if (element.nodeName !== 'INPUT') {
        style.wordWrap = 'break-word'; // only for textarea-s
    }

    // position off-screen
    style.position = 'absolute'; // required to return coordinates properly
    style.visibility = 'hidden'; // not 'display: none' because we want rendering

    // transfer the element's properties to the div
    CSS_TA_PROPERTIES.forEach(function (prop) {
        style[prop] = computed[prop];
    });

    if (isFirefox && element.scrollHeight > parseInt(computed.height)) {
        // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
        style.overflowY = 'scroll';
    } else {
        style.overflow = 'hidden'; // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
    }

    div.textContent = element.value.substring(0, position);
    const span = document.createElement('span');
    // Wrapping must be replicated *exactly*, including when a long word gets
    // onto the next line, with whitespace at the end of the line before (#7).
    // The  *only* reliable way to do that is to copy the *entire* rest of the
    // textarea's content into the <span> created at the caret position.
    span.textContent = element.value.substring(position) || '.'; // || because a completely empty faux span doesn't render at all
    div.appendChild(span);

    const coordinates = {
        top: span.offsetTop + parseInt(computed['borderTopWidth']),
        left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
    };

    document.body.removeChild(div);

    return coordinates;
};

export const interceptPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    let pastedText: string | undefined = undefined;
    if ((window as any).clipboardData && (window as any).clipboardData.getData) {
        // IE
        pastedText = (window as any).clipboardData.getData('Text');
    } else if (e.clipboardData && e.clipboardData.getData) {
        pastedText = e.clipboardData.getData('text/plain');
    }
    return pastedText;
};
