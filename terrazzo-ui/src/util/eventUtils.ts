import React from 'react';

export type EventCaptureFunction = (e: React.SyntheticEvent) => void;
/**
 * A mapping of event names to override functions
 * Any type is used here to allow for flexibility in the event parameter type
 * depending on the specific event (e.g., MouseEvent, KeyboardEvent, etc.)
 * Type safety must be ensured by the caller.
 */
export type EventOverrideFunction = {
    [key: string]: (e: any) => void;
};

export const eventNoop: EventCaptureFunction = (e: React.SyntheticEvent) => {
    // do nothing
};

export const completelyCaptureEvent = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
};

export const noEventBubble = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
};

export const captureAllEvents = (cb: EventCaptureFunction, overrides?: EventOverrideFunction) => {
    return {
        onCopy: cb,
        onCut: cb,
        onPaste: cb,
        onCompositionEnd: cb,
        onCompositionStart: cb,
        onCompositionUpdate: cb,
        onFocus: cb,
        onBlur: cb,
        onChange: cb,
        onBeforeInput: cb,
        onInput: cb,
        onReset: cb,
        onSubmit: cb,
        onInvalid: cb,
        onLoad: cb,
        onError: cb,
        onKeyDown: cb,
        onKeyPress: cb,
        onKeyUp: cb,
        onAbort: cb,
        onCanPlay: cb,
        onCanPlayThrough: cb,
        onDurationChange: cb,
        onEmptied: cb,
        onEncrypted: cb,
        onEnded: cb,
        onLoadedData: cb,
        onLoadedMetadata: cb,
        onLoadStart: cb,
        onPause: cb,
        onPlay: cb,
        onPlaying: cb,
        onProgress: cb,
        onRateChange: cb,
        onResize: cb,
        onSeeked: cb,
        onSeeking: cb,
        onStalled: cb,
        onSuspend: cb,
        onTimeUpdate: cb,
        onVolumeChange: cb,
        onWaiting: cb,
        onAuxClick: cb,
        onClick: cb,
        onContextMenu: cb,
        onDoubleClick: cb,
        onDrag: cb,
        onDragEnd: cb,
        onDragEnter: cb,
        onDragExit: cb,
        onDragLeave: cb,
        onDragOver: cb,
        onDragStart: cb,
        onDrop: cb,
        onMouseDown: cb,
        onMouseEnter: cb,
        onMouseLeave: cb,
        onMouseMove: cb,
        onMouseOut: cb,
        onMouseOver: cb,
        onMouseUp: cb,
        onSelect: cb,
        onTouchCancel: cb,
        onTouchEnd: cb,
        onTouchMove: cb,
        onTouchStart: cb,
        onPointerDown: cb,
        onPointerMove: cb,
        onPointerUp: cb,
        onPointerCancel: cb,
        onPointerEnter: cb,
        onPointerLeave: cb,
        onPointerOver: cb,
        onPointerOut: cb,
        onScroll: cb,
        onWheel: cb,
        onAnimationStart: cb,
        onAnimationEnd: cb,
        onAnimationIteration: cb,
        onTransitionEnd: cb,
        ...overrides,
    };
};

export const captureDraggableEvents = (cb: EventCaptureFunction, overrides?: EventOverrideFunction) => {
    return {
        onDrag: cb,
        onDragEnd: cb,
        onDragEnter: cb,
        onDragExit: cb,
        onDragLeave: cb,
        onDragOver: cb,
        onDragStart: cb,
        onDrop: cb,
        onPointerDown: cb,
        ...overrides,
    };
};

export const forAllClickEvents = (cb: EventCaptureFunction, overrides?: EventOverrideFunction) => {
    return {
        onPointerDown: cb,
        onClick: cb,
        onMouseDown: cb,
        onTouchStart: cb,
        onContextMenu: cb,
        onAuxClick: cb,
        ...overrides,
    };
};

export const forAllReleaseEvents = (cb: EventCaptureFunction, overrides?: EventOverrideFunction) => {
    return {
        onMouseUp: cb,
        onMouseLeave: cb,
        onPointerLeave: cb,
        onPointerUp: cb,
        onTouchEnd: cb,
        ...overrides,
    };
};
